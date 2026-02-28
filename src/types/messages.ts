// ============================================================
// MineAgents - 型定義: メッセージプロトコル
// Webview ↔ Extension Host 間の通信メッセージ型
// ============================================================

/** Webview → Extension Host へ送信するメッセージ */
export type WebviewToExtensionMessage =
    | { type: 'sendMessage'; text: string }
    | { type: 'cancelTask' }
    | { type: 'approveAction'; approvalId: string }
    | { type: 'rejectAction'; approvalId: string }
    | { type: 'updateSettings'; settings: Partial<ExtensionSettings> }
    | { type: 'testConnection' }
    | { type: 'listModels' }
    | { type: 'loadConversation'; conversationId: string }
    | { type: 'newConversation' }
    | { type: 'getState' };

/** Extension Host → Webview へ送信するメッセージ */
export type ExtensionToWebviewMessage =
    | { type: 'streamChunk'; content: string }
    | { type: 'streamEnd' }
    | { type: 'stateChange'; state: AgentState }
    | { type: 'toolCallStarted'; toolCall: ToolCallInfo }
    | { type: 'toolCallCompleted'; toolCallId: string; result: string; success: boolean }
    | { type: 'approvalRequired'; approval: ApprovalRequest }
    | { type: 'error'; error: string }
    | { type: 'connectionStatus'; connected: boolean; error?: string }
    | { type: 'modelList'; models: ModelInfo[] }
    | { type: 'syncState'; state: SyncableState }
    | { type: 'messageAdded'; message: DisplayMessage }
    | { type: 'planPresentation'; plan: AddonPlan }
    | { type: 'progressUpdate'; step: number; total: number; description: string };

// ============================================================
// 共通型
// ============================================================

export type AgentState = 'idle' | 'thinking' | 'executing' | 'waiting_approval' | 'waiting_input' | 'completed' | 'error';

export type InteractionMode = 'guide' | 'free' | 'template';

export type BackendType = 'ollama' | 'lmstudio' | 'openai' | 'gemini' | 'generic';

export interface ExtensionSettings {
    provider: {
        backendType: BackendType;
        baseUrl: string;
        apiKey: string;
        modelId: string;
    };
    agent: {
        maxIterations: number;
        temperature: number;
        interactionMode: InteractionMode;
    };
    stableDiffusion: {
        enabled: boolean;
        baseUrl: string;
    };
    approval: {
        autoApproveWrites: boolean;
    };
}

export interface ModelInfo {
    id: string;
    name: string;
    contextWindow?: number;
    description?: string;
}

export interface ToolCallInfo {
    id: string;
    name: string;
    parameters: Record<string, unknown>;
}

export interface ApprovalRequest {
    id: string;
    toolName: string;
    description: string;
    details: string;
    diff?: string;
}

export interface SyncableState {
    agentState: AgentState;
    settings: ExtensionSettings;
    conversationId: string | null;
    interactionMode: InteractionMode;
}

export interface DisplayMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    toolCalls?: ToolCallInfo[];
    plan?: AddonPlan;
}

// ============================================================
// MC Addon 固有型
// ============================================================

export interface AddonPlan {
    projectName: string;
    namespace: string;
    description: string;
    steps: AddonPlanStep[];
    estimatedTime: string;
}

export interface AddonPlanStep {
    index: number;
    description: string;
    files: string[];
    type: 'create' | 'modify' | 'generate_texture' | 'validate' | 'package';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
