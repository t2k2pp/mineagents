/**
 * ProviderConfig - プロバイダー設定コンポーネント
 *
 * バックエンド選択ドロップダウン（切替時にURLを自動入力）、
 * Base URL入力、APIキーパスワードフィールド。
 */

import React, { useCallback } from 'react';
import type { BackendType } from '../../state/store';

// ---- バックエンドごとのデフォルトURL --------------------------------

const BACKEND_DEFAULTS: Record<BackendType, string> = {
    ollama: 'http://localhost:11434',
    lmstudio: 'http://localhost:1234',
    openai: 'https://api.openai.com',
    gemini: 'https://generativelanguage.googleapis.com',
    generic: '',
};

const BACKEND_LABELS: Record<BackendType, string> = {
    ollama: 'Ollama',
    lmstudio: 'LM Studio',
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    generic: 'Generic OpenAI-compatible',
};

const BACKEND_OPTIONS: BackendType[] = ['ollama', 'lmstudio', 'openai', 'gemini', 'generic'];

// ---- props ---------------------------------------------------------

interface ProviderConfigProps {
    backendType: BackendType;
    baseUrl: string;
    apiKey: string;
    onBackendChange: (backend: BackendType) => void;
    onBaseUrlChange: (url: string) => void;
    onApiKeyChange: (key: string) => void;
}

// ---- component -----------------------------------------------------

export const ProviderConfig: React.FC<ProviderConfigProps> = ({
    backendType,
    baseUrl,
    apiKey,
    onBackendChange,
    onBaseUrlChange,
    onApiKeyChange,
}) => {
    const handleBackendChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newBackend = e.target.value as BackendType;
            onBackendChange(newBackend);
            // バックエンド切替時にデフォルトURLを自動入力
            const defaultUrl = BACKEND_DEFAULTS[newBackend];
            if (defaultUrl) {
                onBaseUrlChange(defaultUrl);
            }
        },
        [onBackendChange, onBaseUrlChange],
    );

    const needsApiKey = backendType === 'openai' || backendType === 'gemini' || backendType === 'generic';

    return (
        <div className="settings-section">
            <h3 className="settings-section-title">
                <i className="codicon codicon-server" />
                プロバイダー設定
            </h3>

            <div className="settings-field">
                <label className="settings-label" htmlFor="backend-type">
                    バックエンド
                </label>
                <select
                    id="backend-type"
                    className="settings-select"
                    value={backendType}
                    onChange={handleBackendChange}
                >
                    {BACKEND_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                            {BACKEND_LABELS[opt]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="settings-field">
                <label className="settings-label" htmlFor="base-url">
                    Base URL
                </label>
                <input
                    id="base-url"
                    type="text"
                    className="settings-input"
                    value={baseUrl}
                    onChange={(e) => onBaseUrlChange(e.target.value)}
                    placeholder={BACKEND_DEFAULTS[backendType] || 'http://localhost:8080'}
                />
            </div>

            <div className="settings-field">
                <label className="settings-label" htmlFor="api-key">
                    API キー
                </label>
                <input
                    id="api-key"
                    type="password"
                    className="settings-input"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder={needsApiKey ? 'APIキーを入力' : 'ローカルサーバーでは通常不要'}
                />
                {!needsApiKey && (
                    <span className="settings-hint">
                        Ollama・LM Studio ではAPIキーは不要です。
                    </span>
                )}
            </div>
        </div>
    );
};
