// ============================================================
// MineAgents - Ollama バックエンドアダプター
// ============================================================

import { BackendAdapter, CompletionRequest, LlmModelInfo } from '../LlmProvider';

export class OllamaBackend implements BackendAdapter {
    readonly id = 'ollama';
    readonly name = 'Ollama';
    readonly defaultBaseUrl = 'http://localhost:11434';

    transformRequest(request: CompletionRequest): Record<string, unknown> {
        const transformed: Record<string, unknown> = {
            messages: request.messages,
            stream: request.stream ?? true,
        };

        if (request.temperature !== undefined) {
            transformed.options = { temperature: request.temperature };
        }

        if (request.tools && request.tools.length > 0) {
            transformed.tools = request.tools;
        }

        return transformed;
    }

    async fetchModels(baseUrl: string): Promise<LlmModelInfo[]> {
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { models: Array<{ name: string; details?: { parameter_size?: string } }> };

        return (data.models ?? []).map((m) => ({
            id: m.name,
            name: m.name,
            description: m.details?.parameter_size ?? undefined,
        }));
    }

    supportsToolCalling(modelId: string): boolean {
        // 大きめのモデルはtool calling対応の可能性が高い
        const lowerModel = modelId.toLowerCase();
        const supportedPatterns = [
            'llama3', 'qwen', 'mistral', 'gemma', 'command-r',
            'deepseek', 'phi-3', 'phi-4',
        ];
        return supportedPatterns.some((p) => lowerModel.includes(p));
    }
}
