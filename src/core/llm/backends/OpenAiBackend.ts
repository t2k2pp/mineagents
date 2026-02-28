// ============================================================
// MineAgents - OpenAI バックエンドアダプター
// ============================================================

import { BackendAdapter, CompletionRequest, LlmModelInfo } from '../LlmProvider';

export class OpenAiBackend implements BackendAdapter {
    readonly id = 'openai';
    readonly name = 'OpenAI';
    readonly defaultBaseUrl = 'https://api.openai.com';

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
        const response = await fetch(`${baseUrl}/v1/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey ?? ''}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { data: Array<{ id: string; owned_by?: string }> };

        return (data.data ?? [])
            .filter((m) => m.id.startsWith('gpt-'))
            .map((m) => ({
                id: m.id,
                name: m.id,
                supportsToolCalling: true,
                description: m.owned_by,
            }));
    }

    supportsToolCalling(_modelId: string): boolean {
        return true;
    }
}
