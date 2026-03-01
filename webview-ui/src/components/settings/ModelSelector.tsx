/**
 * ModelSelector - モデル選択コンポーネント
 *
 * LLMサーバーからモデル一覧を取得→ドロップダウンで選択。
 * 更新ボタン（スピナー付き）、コンテキストウィンドウ表示。
 * 未接続時はヒントを表示。
 */

import React, { useCallback } from 'react';
import type { ModelInfo } from '../../state/store';

// ---- helpers -------------------------------------------------------

function formatContextWindow(tokens: number): string {
    if (tokens >= 1_000_000) {
        return `${(tokens / 1_000_000).toFixed(1)}M tokens`;
    }
    if (tokens >= 1_000) {
        return `${(tokens / 1_000).toFixed(0)}K tokens`;
    }
    return `${tokens} tokens`;
}

// ---- props ---------------------------------------------------------

interface ModelSelectorProps {
    models: ModelInfo[];
    selectedModelId: string;
    isConnected: boolean;
    isLoading: boolean;
    onModelChange: (modelId: string) => void;
    onRefresh: () => void;
}

// ---- component -----------------------------------------------------

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    selectedModelId,
    isConnected,
    isLoading,
    onModelChange,
    onRefresh,
}) => {
    const handleModelChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onModelChange(e.target.value);
        },
        [onModelChange],
    );

    const selectedModel = models.find((m) => m.id === selectedModelId);

    // 未接続＆モデルなし
    if (!isConnected && models.length === 0) {
        return (
            <div className="settings-section">
                <h3 className="settings-section-title">
                    <i className="codicon codicon-symbol-class" />
                    モデル選択
                </h3>
                <div className="settings-empty-state">
                    <i className="codicon codicon-info" />
                    <span>プロバイダーに接続し、更新ボタンを押してモデル一覧を取得してください</span>
                </div>
                <button
                    className="settings-btn settings-btn--secondary"
                    onClick={onRefresh}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <><i className="codicon codicon-loading codicon-modifier-spin" /> 取得中...</>
                    ) : (
                        <><i className="codicon codicon-refresh" /> モデル一覧を取得</>
                    )}
                </button>
            </div>
        );
    }

    // 接続済み
    return (
        <div className="settings-section">
            <h3 className="settings-section-title">
                <i className="codicon codicon-symbol-class" />
                モデル選択
            </h3>

            <div className="settings-field">
                <label className="settings-label" htmlFor="model-select">
                    モデル
                </label>
                <div className="settings-field-row">
                    <select
                        id="model-select"
                        className="settings-select settings-select--flex"
                        value={selectedModelId}
                        onChange={handleModelChange}
                        disabled={isLoading || models.length === 0}
                    >
                        {!selectedModelId && (
                            <option value="">-- モデルを選択 --</option>
                        )}
                        {models.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name || model.id}
                            </option>
                        ))}
                    </select>
                    <button
                        className="settings-btn-icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                        title="モデル一覧を更新"
                        aria-label="モデル一覧を更新"
                    >
                        <i
                            className={`codicon ${isLoading
                                    ? 'codicon-loading codicon-modifier-spin'
                                    : 'codicon-refresh'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {selectedModel?.contextWindow && (
                <div className="settings-model-info">
                    <i className="codicon codicon-window" />
                    <span>コンテキストウィンドウ: {formatContextWindow(selectedModel.contextWindow)}</span>
                </div>
            )}
        </div>
    );
};
