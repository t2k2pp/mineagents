// ============================================================
// MineAgents - Gemini バックエンドアダプター
// Google Gemini API (OpenAI互換エンドポイント経由)
// ============================================================

import { BackendAdapter, CompletionRequest, LlmModelInfo } from '../LlmProvider';

export class GeminiBackend implements BackendAdapter {
    readonly id = 'gemini';
    readonly name = 'Google Gemini';
    readonly defaultBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';

    transformRequest(request: CompletionRequest): Record<string, unknown> {
        const transformed: Record<string, unknown> = {
            messages: request.messages,
            stream: request.stream ?? true,
        };

        if (request.temperature !== undefined) {
            transformed.temperature = request.temperature;
        }

        if (request.maxTokens !== undefined) {
            transformed.max_tokens = request.maxTokens;
        }

        if (request.tools && request.tools.length > 0) {
            transformed.tools = request.tools;
            transformed.tool_choice = 'auto';
        }

        return transformed;
    }

    async fetchModels(baseUrl: string, apiKey?: string): Promise<LlmModelInfo[]> {
        // Gemini OpenAI互換エンドポイントのモデル一覧
        const response = await fetch(`${baseUrl}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey ?? ''}`,
            },
        });

        if (!response.ok) {
            // フォールバック: 既知のモデルリストを返す
            return this.getKnownModels();
        }

        try {
            const data = (await response.json()) as { data: Array<{ id: string }> };
            return (data.data ?? []).map((m) => ({
                id: m.id,
                name: m.id,
                supportsToolCalling: true,
            }));
        } catch {
            return this.getKnownModels();
        }
    }

    supportsToolCalling(_modelId: string): boolean {
        return true;
    }

    private getKnownModels(): LlmModelInfo[] {
        return [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', supportsToolCalling: true, contextWindow: 1048576 },
            { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', supportsToolCalling: true, contextWindow: 1048576 },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', supportsToolCalling: true, contextWindow: 2097152 },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', supportsToolCalling: true, contextWindow: 1048576 },
        ];
    }
}
