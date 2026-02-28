// ============================================================
// MineAgents - Stable Diffusion API クライアント
// ComfyUI REST API 経由でテクスチャを生成
// ============================================================

export interface TextureGenerationOptions {
    /** 生成プロンプト */
    prompt: string;
    /** ネガティブプロンプト */
    negativePrompt?: string;
    /** 出力幅（SD生成時） */
    width?: number;
    /** 出力高さ（SD生成時） */
    height?: number;
    /** 最終テクスチャサイズ */
    targetSize?: number;
    /** シード (-1 でランダム) */
    seed?: number;
    /** 候補生成数 */
    batchSize?: number;
}

export interface GeneratedTexture {
    /** PNG画像データ (Buffer) */
    imageBuffer: Buffer;
    /** 使用されたシード */
    seed: number;
    /** 候補インデックス */
    index: number;
}

export class StableDiffusionClient {
    constructor(
        private baseUrl: string,
    ) { }

    /**
     * ComfyUI にテクスチャ生成リクエストを送信
     */
    async generateTexture(options: TextureGenerationOptions): Promise<GeneratedTexture[]> {
        const width = options.width ?? 512;
        const height = options.height ?? 512;
        const seed = options.seed ?? -1;
        const batchSize = options.batchSize ?? 1;

        // MC用プロンプト拡張
        const enhancedPrompt = this.enhancePromptForMinecraft(options.prompt);

        // ComfyUI ワークフロー構築
        const workflow = this.buildComfyWorkflow({
            prompt: enhancedPrompt,
            negativePrompt: options.negativePrompt ?? 'blurry, realistic photo, 3d render, watermark, text',
            width,
            height,
            seed,
            batchSize,
        });

        // ComfyUI API: POST /prompt
        const promptResponse = await fetch(`${this.baseUrl}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow }),
        });

        if (!promptResponse.ok) {
            throw new Error(`ComfyUI prompt failed: ${promptResponse.status}`);
        }

        const { prompt_id } = (await promptResponse.json()) as { prompt_id: string };

        // ポーリングで完了を待機
        const images = await this.waitForCompletion(prompt_id);
        return images;
    }

    /**
     * 接続テスト
     */
    async testConnection(): Promise<{ ok: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/system_stats`);
            return { ok: response.ok };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    /**
     * MC向けプロンプト拡張
     */
    private enhancePromptForMinecraft(prompt: string): string {
        const prefix = 'pixel art, 16-bit style, game asset, minecraft style, ';
        const suffix = ', pixel perfect, clean edges, transparent background, top-down view';
        return `${prefix}${prompt}${suffix}`;
    }

    /**
     * ComfyUI ワークフロー構築（テキスト→画像基本ワークフロー）
     */
    private buildComfyWorkflow(params: {
        prompt: string;
        negativePrompt: string;
        width: number;
        height: number;
        seed: number;
        batchSize: number;
    }): Record<string, unknown> {
        return {
            // KSampler
            '3': {
                class_type: 'KSampler',
                inputs: {
                    seed: params.seed === -1 ? Math.floor(Math.random() * 2147483647) : params.seed,
                    steps: 20,
                    cfg: 7.5,
                    sampler_name: 'euler_a',
                    scheduler: 'normal',
                    denoise: 1,
                    model: ['4', 0],
                    positive: ['6', 0],
                    negative: ['7', 0],
                    latent_image: ['5', 0],
                },
            },
            // CheckpointLoader
            '4': {
                class_type: 'CheckpointLoaderSimple',
                inputs: { ckpt_name: 'sd_v1-5.safetensors' },
            },
            // EmptyLatentImage
            '5': {
                class_type: 'EmptyLatentImage',
                inputs: {
                    width: params.width,
                    height: params.height,
                    batch_size: params.batchSize,
                },
            },
            // CLIP Text Encode (positive)
            '6': {
                class_type: 'CLIPTextEncode',
                inputs: { text: params.prompt, clip: ['4', 1] },
            },
            // CLIP Text Encode (negative)
            '7': {
                class_type: 'CLIPTextEncode',
                inputs: { text: params.negativePrompt, clip: ['4', 1] },
            },
            // VAE Decode
            '8': {
                class_type: 'VAEDecode',
                inputs: { samples: ['3', 0], vae: ['4', 2] },
            },
            // SaveImage
            '9': {
                class_type: 'SaveImage',
                inputs: { images: ['8', 0], filename_prefix: 'mineagents' },
            },
        };
    }

    /**
     * ComfyUI の処理完了を待ってイメージを取得
     */
    private async waitForCompletion(promptId: string): Promise<GeneratedTexture[]> {
        const maxWait = 120_000; // 120秒
        const interval = 2_000;  // 2秒ごとにポーリング
        let elapsed = 0;

        while (elapsed < maxWait) {
            await this.sleep(interval);
            elapsed += interval;

            const historyResponse = await fetch(`${this.baseUrl}/history/${promptId}`);
            if (!historyResponse.ok) continue;

            const history = (await historyResponse.json()) as Record<string, {
                outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;
            }>;

            const entry = history[promptId];
            if (!entry?.outputs) continue;

            const results: GeneratedTexture[] = [];
            for (const nodeOutput of Object.values(entry.outputs)) {
                if (!nodeOutput.images) continue;
                for (let i = 0; i < nodeOutput.images.length; i++) {
                    const img = nodeOutput.images[i];
                    // 画像データを取得
                    const imageResponse = await fetch(
                        `${this.baseUrl}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`,
                    );
                    if (imageResponse.ok) {
                        const buffer = Buffer.from(await imageResponse.arrayBuffer());
                        results.push({
                            imageBuffer: buffer,
                            seed: 0, // ComfyUIのhistoryからseedを取得する実装は将来対応
                            index: i,
                        });
                    }
                }
            }

            if (results.length > 0) return results;
        }

        throw new Error('Texture generation timed out');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
