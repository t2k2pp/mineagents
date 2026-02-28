// ============================================================
// MineAgents - LLMプロバイダー インターフェース
// ローカルLLM / クラウドLLM共通の抽象化層
// ============================================================

export interface LlmProvider {
    readonly id: string;
    readonly name: string;

    /** 接続テスト */
    testConnection(): Promise<{ ok: boolean; error?: string }>;

    /** 利用可能なモデル一覧を取得 */
    listModels(): Promise<LlmModelInfo[]>;

    /** ストリーミング応答を取得 */
    streamCompletion(request: CompletionRequest): AsyncIterable<CompletionChunk>;

    /** 非ストリーミング応答を取得 */
    complete(request: CompletionRequest): Promise<CompletionResponse>;

    /** トークン数を概算 */
    countTokens(text: string): number;

    /** リソース解放 */
    dispose(): void;
}

// ============================================================
// LLM 関連型定義
// ============================================================

export interface LlmModelInfo {
    id: string;
    name: string;
    contextWindow?: number;
    supportsToolCalling?: boolean;
    description?: string;
}

export interface CompletionRequest {
    messages: ChatMessage[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    name?: string;
}

export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface CompletionChunk {
    content?: string;
    toolCalls?: ToolCall[];
    done: boolean;
}

export interface CompletionResponse {
    content: string | null;
    toolCalls: ToolCall[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// ============================================================
// バックエンドアダプター インターフェース
// ============================================================

export interface BackendAdapter {
    readonly id: string;
    readonly name: string;
    readonly defaultBaseUrl: string;

    /** バックエンド固有のリクエスト変換 */
    transformRequest(request: CompletionRequest): Record<string, unknown>;

    /** バックエンド固有のモデル一覧取得 */
    fetchModels(baseUrl: string, apiKey?: string): Promise<LlmModelInfo[]>;

    /** Tool Callingをサポートしているか判定 */
    supportsToolCalling(modelId: string): boolean;
}
