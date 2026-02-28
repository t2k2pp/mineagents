// ============================================================
// MineAgents - OpenAI互換プロバイダー
// Ollama / LM Studio / OpenAI / Gemini 等の共通実装
// ============================================================

import {
    LlmProvider,
    LlmModelInfo,
    CompletionRequest,
    CompletionResponse,
    CompletionChunk,
    BackendAdapter,
    ChatMessage,
    ToolCall,
} from './LlmProvider';

export class OpenAiCompatibleProvider implements LlmProvider {
    readonly id: string;
    readonly name: string;

    constructor(
        private baseUrl: string,
        private apiKey: string,
        private modelId: string,
        private backend: BackendAdapter,
    ) {
        this.id = backend.id;
        this.name = backend.name;
    }

    async testConnection(): Promise<{ ok: boolean; error?: string }> {
        try {
            const models = await this.listModels();
            return { ok: models.length > 0 };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    async listModels(): Promise<LlmModelInfo[]> {
        return this.backend.fetchModels(this.baseUrl, this.apiKey);
    }

    async *streamCompletion(request: CompletionRequest): AsyncIterable<CompletionChunk> {
        const url = this.getCompletionUrl();
        const body = this.buildRequestBody(request, true);

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LLM request failed (${response.status}): ${errorText}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        yield* this.parseSSEStream(response.body);
    }

    async complete(request: CompletionRequest): Promise<CompletionResponse> {
        const url = this.getCompletionUrl();
        const body = this.buildRequestBody(request, false);

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LLM request failed (${response.status}): ${errorText}`);
        }

        const data = (await response.json()) as {
            choices: Array<{
                message: {
                    content: string | null;
                    tool_calls?: ToolCall[];
                };
            }>;
            usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        };

        const choice = data.choices?.[0];
        return {
            content: choice?.message?.content ?? null,
            toolCalls: choice?.message?.tool_calls ?? [],
            usage: data.usage
                ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                }
                : undefined,
        };
    }

    countTokens(text: string): number {
        // 簡易的な概算（実際にはgpt-tokenizerを使用）
        return Math.ceil(text.length / 4);
    }

    dispose(): void {
        // cleanup if needed
    }

    // ============================================================
    // Private
    // ============================================================

    private getCompletionUrl(): string {
        // Ollamaは /api/chat, それ以外は /v1/chat/completions
        if (this.backend.id === 'ollama') {
            return `${this.baseUrl}/api/chat`;
        }
        return `${this.baseUrl}/v1/chat/completions`;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    private buildRequestBody(request: CompletionRequest, stream: boolean): Record<string, unknown> {
        const base = this.backend.transformRequest(request);
        return {
            ...base,
            model: this.modelId,
            stream,
        };
    }

    private async *parseSSEStream(body: ReadableStream<Uint8Array>): AsyncIterable<CompletionChunk> {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    const trimmed = line.trim();

                    // Ollama形式（JSON per line）
                    if (this.backend.id === 'ollama' && trimmed.startsWith('{')) {
                        yield* this.parseOllamaChunk(trimmed);
                        continue;
                    }

                    // SSE形式
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6);
                        if (data === '[DONE]') {
                            yield { done: true };
                            return;
                        }
                        yield* this.parseSSEChunk(data);
                    }
                }
            }

            // 残りのバッファを処理
            if (buffer.trim()) {
                if (this.backend.id === 'ollama' && buffer.trim().startsWith('{')) {
                    yield* this.parseOllamaChunk(buffer.trim());
                }
            }

            yield { done: true };
        } finally {
            reader.releaseLock();
        }
    }

    private *parseOllamaChunk(jsonStr: string): Iterable<CompletionChunk> {
        try {
            const data = JSON.parse(jsonStr) as {
                done: boolean;
                message?: { content?: string; tool_calls?: ToolCall[] };
            };
            yield {
                content: data.message?.content ?? undefined,
                toolCalls: data.message?.tool_calls ?? undefined,
                done: data.done,
            };
        } catch {
            // JSON parse error - skip
        }
    }

    private *parseSSEChunk(jsonStr: string): Iterable<CompletionChunk> {
        try {
            const data = JSON.parse(jsonStr) as {
                choices: Array<{
                    delta: { content?: string; tool_calls?: ToolCall[] };
                    finish_reason: string | null;
                }>;
            };
            const choice = data.choices?.[0];
            if (choice) {
                yield {
                    content: choice.delta?.content ?? undefined,
                    toolCalls: choice.delta?.tool_calls ?? undefined,
                    done: choice.finish_reason !== null,
                };
            }
        } catch {
            // JSON parse error - skip
        }
    }
}
