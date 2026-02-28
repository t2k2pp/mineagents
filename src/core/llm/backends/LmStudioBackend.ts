// ============================================================
// MineAgents - LM Studio バックエンドアダプター
// ============================================================

import { BackendAdapter, CompletionRequest, LlmModelInfo } from '../LlmProvider';

export class LmStudioBackend implements BackendAdapter {
    readonly id = 'lmstudio';
    readonly name = 'LM Studio';
    readonly defaultBaseUrl = 'http://localhost:1234';

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
        const headers: Record<string, string> = {};
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(`${baseUrl}/v1/models`, { headers });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { data: Array<{ id: string }> };
        return (data.data ?? []).map((m) => ({
            id: m.id,
            name: m.id,
        }));
    }

    supportsToolCalling(_modelId: string): boolean {
        return true; // LM Studio は最新版でFunction Calling対応
    }
}
