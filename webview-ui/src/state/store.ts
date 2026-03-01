// ============================================================
// Zustand ストア - UI状態管理
// ============================================================

import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
    toolCalls?: Array<{ id: string; name: string; status: string; result?: string }>;
}

export interface ModelInfo {
    id: string;
    name: string;
    contextWindow?: number;
    description?: string;
}

export type BackendType = 'ollama' | 'lmstudio' | 'openai' | 'gemini' | 'generic';

export type ViewMode = 'chat' | 'settings' | 'history';
export type AgentState = 'idle' | 'thinking' | 'executing' | 'waiting_approval' | 'waiting_input' | 'completed' | 'error';

interface SettingsLocal {
    backendType: BackendType;
    baseUrl: string;
    apiKey: string;
    modelId: string;
    maxIterations: number;
    temperature: number;
    sdEnabled: boolean;
    sdBaseUrl: string;
}

interface AppState {
    // UI
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;

    // Messages
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    updateStreamingMessage: (content: string) => void;
    clearMessages: () => void;

    // Agent State
    agentState: AgentState;
    setAgentState: (state: AgentState) => void;

    // Connection
    connected: boolean;
    setConnected: (connected: boolean) => void;
    connectionError: string | null;
    setConnectionError: (error: string | null) => void;

    // Progress
    progress: { step: number; total: number; description: string } | null;
    setProgress: (progress: { step: number; total: number; description: string } | null) => void;

    // Models (from LLM server)
    models: ModelInfo[];
    setModels: (models: ModelInfo[]) => void;
    loadingModels: boolean;
    setLoadingModels: (loading: boolean) => void;

    // Settings (local draft)
    settingsLocal: SettingsLocal;
    updateSettingsLocal: (partial: Partial<SettingsLocal>) => void;
    initSettingsLocal: (s: SettingsLocal) => void;
}

const DEFAULT_SETTINGS: SettingsLocal = {
    backendType: 'ollama',
    baseUrl: 'http://localhost:11434',
    apiKey: '',
    modelId: '',
    maxIterations: 25,
    temperature: 0,
    sdEnabled: false,
    sdBaseUrl: 'http://localhost:7860',
};

export const useAppStore = create<AppState>((set) => ({
    // UI
    viewMode: 'chat',
    setViewMode: (mode) => set({ viewMode: mode }),

    // Messages
    messages: [],
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages.filter((m) => !m.isStreaming), msg],
    })),
    updateStreamingMessage: (content) => set((state) => {
        const msgs = [...state.messages];
        const streamIdx = msgs.findIndex((m) => m.isStreaming);
        if (streamIdx >= 0) {
            msgs[streamIdx] = { ...msgs[streamIdx], content: msgs[streamIdx].content + content };
        } else {
            msgs.push({
                id: `assistant-stream-${Date.now()}`,
                role: 'assistant',
                content,
                timestamp: Date.now(),
                isStreaming: true,
            });
        }
        return { messages: msgs };
    }),
    clearMessages: () => set({ messages: [] }),

    // Agent State
    agentState: 'idle',
    setAgentState: (state) => set({ agentState: state }),

    // Connection
    connected: false,
    setConnected: (connected) => set({ connected }),
    connectionError: null,
    setConnectionError: (error) => set({ connectionError: error }),

    // Progress
    progress: null,
    setProgress: (progress) => set({ progress }),

    // Models
    models: [],
    setModels: (models) => set({ models }),
    loadingModels: false,
    setLoadingModels: (loading) => set({ loadingModels: loading }),

    // Settings
    settingsLocal: { ...DEFAULT_SETTINGS },
    updateSettingsLocal: (partial) => set((state) => ({
        settingsLocal: { ...state.settingsLocal, ...partial },
    })),
    initSettingsLocal: (s) => set({ settingsLocal: s }),
}));

