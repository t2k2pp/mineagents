/**
 * SettingsView - 設定画面コンポーネント
 *
 * ProviderConfig + ModelSelector + エージェント設定 + SD設定 を統合。
 * 保存/キャンセル/接続テストボタン付き。
 */

import React, { useCallback, useEffect } from 'react';
import { useAppStore } from '../../state/store';
import type { BackendType } from '../../state/store';
import { ProviderConfig } from './ProviderConfig';
import { ModelSelector } from './ModelSelector';
import { vscode } from '../../vscode';

export const SettingsView: React.FC = () => {
    const {
        settingsLocal, updateSettingsLocal,
        models, setModels, loadingModels, setLoadingModels,
        connected, setConnected, connectionError, setConnectionError,
        setViewMode,
    } = useAppStore();

    // 初回マウント時にモデル一覧と接続テスト
    useEffect(() => {
        // modelListメッセージの受信はApp.tsxで処理
    }, []);

    const handleRefreshModels = useCallback(() => {
        setLoadingModels(true);
        vscode.postMessage({ type: 'listModels' });
        // レスポンスはApp.tsx経由でストアに反映
    }, [setLoadingModels]);

    const handleTestConnection = useCallback(() => {
        vscode.postMessage({ type: 'testConnection' });
    }, []);

    const handleSave = useCallback(() => {
        // WebviewからExtension Hostへ設定を送信
        vscode.postMessage({
            type: 'updateSettings',
            settings: {
                provider: {
                    backendType: settingsLocal.backendType,
                    baseUrl: settingsLocal.baseUrl,
                    apiKey: settingsLocal.apiKey,
                    modelId: settingsLocal.modelId,
                },
                agent: {
                    maxIterations: settingsLocal.maxIterations,
                    temperature: settingsLocal.temperature,
                },
                stableDiffusion: {
                    enabled: settingsLocal.sdEnabled,
                    baseUrl: settingsLocal.sdBaseUrl,
                },
            },
        });
        setViewMode('chat');
    }, [settingsLocal, setViewMode]);

    const handleCancel = useCallback(() => {
        setViewMode('chat');
    }, [setViewMode]);

    return (
        <div className="settings-view">
            <div className="settings-header">
                <h2 className="settings-title">
                    <i className="codicon codicon-gear" /> 設定
                </h2>
                <button className="settings-btn-icon" onClick={handleCancel} title="閉じる">
                    <i className="codicon codicon-close" />
                </button>
            </div>

            <div className="settings-content">
                {/* プロバイダー設定 */}
                <ProviderConfig
                    backendType={settingsLocal.backendType}
                    baseUrl={settingsLocal.baseUrl}
                    apiKey={settingsLocal.apiKey}
                    onBackendChange={(b: BackendType) => updateSettingsLocal({ backendType: b })}
                    onBaseUrlChange={(url: string) => updateSettingsLocal({ baseUrl: url })}
                    onApiKeyChange={(key: string) => updateSettingsLocal({ apiKey: key })}
                />

                {/* 接続テスト */}
                <div className="settings-section">
                    <button
                        className="settings-btn settings-btn--secondary"
                        onClick={handleTestConnection}
                    >
                        <i className="codicon codicon-plug" /> 接続テスト
                    </button>
                    {connected && (
                        <span className="settings-status settings-status--ok">
                            <i className="codicon codicon-check" /> 接続成功
                        </span>
                    )}
                    {connectionError && (
                        <span className="settings-status settings-status--error">
                            <i className="codicon codicon-error" /> {connectionError}
                        </span>
                    )}
                </div>

                {/* モデル選択 */}
                <ModelSelector
                    models={models}
                    selectedModelId={settingsLocal.modelId}
                    isConnected={connected}
                    isLoading={loadingModels}
                    onModelChange={(id: string) => updateSettingsLocal({ modelId: id })}
                    onRefresh={handleRefreshModels}
                />

                {/* エージェント設定 */}
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        <i className="codicon codicon-settings" /> エージェント設定
                    </h3>

                    <div className="settings-field">
                        <label className="settings-label" htmlFor="max-iterations">
                            最大イテレーション数
                        </label>
                        <input
                            id="max-iterations"
                            type="number"
                            className="settings-input settings-input--short"
                            min={1}
                            max={100}
                            value={settingsLocal.maxIterations}
                            onChange={(e) => updateSettingsLocal({ maxIterations: parseInt(e.target.value) || 25 })}
                        />
                    </div>

                    <div className="settings-field">
                        <label className="settings-label" htmlFor="temperature">
                            Temperature
                        </label>
                        <input
                            id="temperature"
                            type="number"
                            className="settings-input settings-input--short"
                            min={0}
                            max={2}
                            step={0.1}
                            value={settingsLocal.temperature}
                            onChange={(e) => updateSettingsLocal({ temperature: parseFloat(e.target.value) || 0 })}
                        />
                        <span className="settings-hint">0 = 決定的、高い値 = 多様性</span>
                    </div>
                </div>

                {/* Stable Diffusion設定 */}
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        <i className="codicon codicon-paintcan" /> Stable Diffusion
                    </h3>

                    <div className="settings-field">
                        <label className="settings-checkbox-label">
                            <input
                                type="checkbox"
                                checked={settingsLocal.sdEnabled}
                                onChange={(e) => updateSettingsLocal({ sdEnabled: e.target.checked })}
                            />
                            テクスチャ生成を有効にする
                        </label>
                    </div>

                    {settingsLocal.sdEnabled && (
                        <div className="settings-field">
                            <label className="settings-label" htmlFor="sd-base-url">
                                SD API URL
                            </label>
                            <input
                                id="sd-base-url"
                                type="text"
                                className="settings-input"
                                value={settingsLocal.sdBaseUrl}
                                onChange={(e) => updateSettingsLocal({ sdBaseUrl: e.target.value })}
                                placeholder="http://localhost:7860"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* フッター */}
            <div className="settings-footer">
                <button className="settings-btn settings-btn--primary" onClick={handleSave}>
                    <i className="codicon codicon-save" /> 保存
                </button>
                <button className="settings-btn settings-btn--secondary" onClick={handleCancel}>
                    キャンセル
                </button>
            </div>
        </div>
    );
};
