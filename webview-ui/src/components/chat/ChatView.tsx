import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../state/store';
import { InputArea } from './InputArea';
import { vscode } from '../../vscode';

export const ChatView: React.FC = () => {
    const { messages, agentState, progress, setViewMode } = useAppStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (text: string) => {
        vscode.postMessage({ type: 'sendMessage', text });
    };

    const quickActions = [
        { label: '🗡️ カスタム武器を作る', prompt: 'カスタム武器のアドオンを作りたい' },
        { label: '🧱 カスタムブロックを作る', prompt: 'カスタムブロックのアドオンを作りたい' },
        { label: '🐾 カスタムモブを作る', prompt: 'カスタムモブのアドオンを作りたい' },
        { label: '❓ 何ができるか教えて', prompt: 'このツールで何ができるの？' },
    ];

    const showWelcome = messages.length === 0;

    return (
        <>
            {/* Header */}
            <div className="app-header">
                <span className="app-header-title">⛏️ MineAgents</span>
                <span className="app-header-status">
                    <span className={`status-dot ${agentState}`} />
                    {agentState === 'idle' && '待機中'}
                    {agentState === 'thinking' && '考え中...'}
                    {agentState === 'executing' && '実行中...'}
                    {agentState === 'completed' && '完了'}
                    {agentState === 'error' && 'エラー'}
                </span>
                <button
                    className="app-toolbar-btn"
                    onClick={() => setViewMode('settings')}
                    title="設定"
                >
                    <i className="codicon codicon-gear" />
                </button>
            </div>

            {/* Chat Messages or Welcome */}
            {showWelcome ? (
                <div className="welcome">
                    <div className="welcome-icon">⛏️</div>
                    <div className="welcome-title">MineAgents</div>
                    <div className="welcome-description">
                        統合版マインクラフトのアドオンをAIで作成します。
                        作りたいものを教えてください！
                    </div>
                    <div className="welcome-actions">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                className="quick-action"
                                onClick={() => handleSend(action.prompt)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="chat-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.role}`}>
                            {msg.content}
                            {msg.isStreaming && <span className="cursor">▊</span>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Progress Bar */}
            {progress && (
                <div className="progress-bar">
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${(progress.step / progress.total) * 100}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        [{progress.step}/{progress.total}] {progress.description}
                    </div>
                </div>
            )}

            {/* Input */}
            <InputArea
                onSend={handleSend}
                disabled={agentState === 'thinking' || agentState === 'executing'}
            />
        </>
    );
};
