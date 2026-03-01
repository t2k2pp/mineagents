import React, { useEffect } from 'react';
import { ChatView } from './components/chat/ChatView';
import { SettingsView } from './components/settings/SettingsView';
import { useAppStore } from './state/store';
import { vscode } from './vscode';

export const App: React.FC = () => {
    const {
        viewMode, setViewMode,
        setAgentState, addMessage, updateStreamingMessage,
        setConnected, setConnectionError, setProgress,
        setModels, setLoadingModels,
        initSettingsLocal,
    } = useAppStore();

    useEffect(() => {
        // Extension Host からのメッセージを受信
        const handleMessage = (event: MessageEvent) => {
            const msg = event.data;
            switch (msg.type) {
                case 'stateChange':
                    setAgentState(msg.state);
                    break;
                case 'streamChunk':
                    updateStreamingMessage(msg.content);
                    break;
                case 'streamEnd': {
                    // ストリーミング中のメッセージを確定
                    const store = useAppStore.getState();
                    const msgs = store.messages;
                    const streamMsg = msgs.find((m) => m.isStreaming);
                    if (streamMsg) {
                        addMessage({ ...streamMsg, isStreaming: false });
                    }
                    break;
                }
                case 'messageAdded':
                    addMessage(msg.message);
                    break;
                case 'toolCallStarted':
                    break;
                case 'toolCallCompleted':
                    break;
                case 'error':
                    addMessage({
                        id: `error-${Date.now()}`,
                        role: 'system',
                        content: `⚠️ エラー: ${msg.error}`,
                        timestamp: Date.now(),
                    });
                    break;
                case 'connectionStatus':
                    setConnected(msg.connected);
                    setConnectionError(msg.error ?? null);
                    break;
                case 'modelList':
                    setModels(msg.models);
                    setLoadingModels(false);
                    break;
                case 'progressUpdate':
                    setProgress({ step: msg.step, total: msg.total, description: msg.description });
                    break;
                case 'syncState':
                    setAgentState(msg.state.agentState);
                    // 設定をローカルステートに同期
                    if (msg.state.settings) {
                        const s = msg.state.settings;
                        initSettingsLocal({
                            backendType: s.provider?.backendType ?? 'ollama',
                            baseUrl: s.provider?.baseUrl ?? 'http://localhost:11434',
                            apiKey: s.provider?.apiKey ?? '',
                            modelId: s.provider?.modelId ?? '',
                            maxIterations: s.agent?.maxIterations ?? 25,
                            temperature: s.agent?.temperature ?? 0,
                            sdEnabled: s.stableDiffusion?.enabled ?? false,
                            sdBaseUrl: s.stableDiffusion?.baseUrl ?? 'http://localhost:7860',
                        });
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ type: 'getState' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="app">
            {viewMode === 'chat' && <ChatView />}
            {viewMode === 'settings' && <SettingsView />}
        </div>
    );
};
