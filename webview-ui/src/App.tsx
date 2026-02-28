import React, { useEffect } from 'react';
import { ChatView } from './components/chat/ChatView';
import { useAppStore } from './state/store';
import { vscode } from './vscode';

export const App: React.FC = () => {
    const { setAgentState, addMessage, updateStreamingMessage, setConnected, setConnectionError, setProgress } = useAppStore();

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
                    // ツール呼び出し開始の表示は将来対応
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
                case 'progressUpdate':
                    setProgress({ step: msg.step, total: msg.total, description: msg.description });
                    break;
                case 'syncState':
                    setAgentState(msg.state.agentState);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ type: 'getState' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="app">
            <ChatView />
        </div>
    );
};
