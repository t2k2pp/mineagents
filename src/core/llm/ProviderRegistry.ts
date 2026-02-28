// ============================================================
// MineAgents - プロバイダーレジストリ
// LLMプロバイダーの生成・管理
// ============================================================

import { LlmProvider, BackendAdapter } from './LlmProvider';
import { OpenAiCompatibleProvider } from './OpenAiCompatibleProvider';
import { OllamaBackend } from './backends/OllamaBackend';
import { OpenAiBackend } from './backends/OpenAiBackend';
import { GeminiBackend } from './backends/GeminiBackend';
import { LmStudioBackend } from './backends/LmStudioBackend';
import { BackendType } from '../../types/messages';

/** バックエンドタイプから適切なアダプターを生成 */
function createBackend(backendType: BackendType): BackendAdapter {
    switch (backendType) {
        case 'ollama':
            return new OllamaBackend();
        case 'openai':
            return new OpenAiBackend();
        case 'gemini':
            return new GeminiBackend();
        case 'lmstudio':
            return new LmStudioBackend();
        case 'generic':
            // 汎用: OpenAI互換として扱う
            return new OpenAiBackend();
        default:
            return new OllamaBackend();
    }
}

export interface ProviderConfig {
    backendType: BackendType;
    baseUrl: string;
    apiKey: string;
    modelId: string;
}

export class ProviderRegistry {
    private providers: Map<string, LlmProvider> = new Map();

    /** 設定からプロバイダーを生成して登録 */
    createProvider(config: ProviderConfig): LlmProvider {
        const key = `${config.backendType}:${config.baseUrl}:${config.modelId}`;

        // キャッシュチェック
        const existing = this.providers.get(key);
        if (existing) {
            return existing;
        }

        const backend = createBackend(config.backendType);
        const baseUrl = config.baseUrl || backend.defaultBaseUrl;

        const provider = new OpenAiCompatibleProvider(
            baseUrl,
            config.apiKey,
            config.modelId,
            backend,
        );

        this.providers.set(key, provider);
        return provider;
    }

    /** 全プロバイダーを解放 */
    disposeAll(): void {
        for (const provider of this.providers.values()) {
            provider.dispose();
        }
        this.providers.clear();
    }

    /** デフォルトURLを取得 */
    static getDefaultUrl(backendType: BackendType): string {
        const backend = createBackend(backendType);
        return backend.defaultBaseUrl;
    }
}
