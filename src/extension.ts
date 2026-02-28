// ============================================================
// MineAgents - VSCode拡張機能 エントリポイント
// ============================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { WebviewProvider } from './webview/WebviewProvider';
import { AgentLoop, TaskState, AgentLoopEvents } from './core/agent/AgentLoop';
import { ToolRegistry } from './core/tools/ToolRegistry';
import { ProviderRegistry } from './core/llm/ProviderRegistry';
import { ReadFileTool } from './core/tools/handlers/ReadFileTool';
import { WriteFileTool } from './core/tools/handlers/WriteFileTool';
import { ListFilesTool } from './core/tools/handlers/ListFilesTool';
import { AskUserTool } from './core/tools/handlers/AskUserTool';
import { TaskCompleteTool } from './core/tools/handlers/TaskCompleteTool';
import { CreateAddonProjectTool } from './minecraft/tools/CreateAddonProjectTool';
import { AddItemTool } from './minecraft/tools/AddItemTool';
import { AddBlockTool } from './minecraft/tools/AddBlockTool';
import { AddRecipeTool } from './minecraft/tools/AddRecipeTool';
import { ValidateAddonTool } from './minecraft/tools/ValidateAddonTool';
import { PackageAddonTool } from './minecraft/tools/PackageAddonTool';
import { QueryKnowledgeTool } from './minecraft/tools/QueryKnowledgeTool';
import { CreateUiPackTool } from './minecraft/tools/CreateUiPackTool';
import { KnowledgeEngine } from './core/knowledge/KnowledgeEngine';
import { ConversationFlowManager } from './minecraft/conversation/ConversationFlowManager';
import { ToolContext } from './core/tools/types';
import { ExtensionSettings, WebviewToExtensionMessage, BackendType } from './types/messages';

let agentLoop: AgentLoop | undefined;
let flowManager: ConversationFlowManager;
let webviewProvider: WebviewProvider;
const providerRegistry = new ProviderRegistry();
const knowledgeEngine = new KnowledgeEngine();

export function activate(context: vscode.ExtensionContext): void {
    console.log('MineAgents is activating...');

    // 対話フローマネージャーを初期化
    flowManager = new ConversationFlowManager();

    // WebviewProviderを登録
    webviewProvider = new WebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            WebviewProvider.viewType,
            webviewProvider,
        ),
    );

    // Webviewからのメッセージハンドラ
    webviewProvider.onMessage(async (message) => {
        const msg = message as WebviewToExtensionMessage;
        await handleWebviewMessage(msg, context);
    });

    // コマンド登録
    context.subscriptions.push(
        vscode.commands.registerCommand('mineagents.newChat', () => {
            agentLoop?.reset();
            flowManager.reset();
            webviewProvider.postMessage({ type: 'newConversation' });
        }),
        vscode.commands.registerCommand('mineagents.cancelTask', () => {
            agentLoop?.cancel();
        }),
        vscode.commands.registerCommand('mineagents.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'mineagents');
        }),
    );

    console.log('MineAgents activated successfully.');
}

export function deactivate(): void {
    agentLoop?.cancel();
}

// ============================================================
// メッセージハンドラ
// ============================================================

async function handleWebviewMessage(
    msg: WebviewToExtensionMessage,
    context: vscode.ExtensionContext,
): Promise<void> {
    switch (msg.type) {
        case 'sendMessage':
            await handleUserMessage(msg.text, context);
            break;
        case 'cancelTask':
            agentLoop?.cancel();
            break;
        case 'testConnection':
            await handleTestConnection(context);
            break;
        case 'listModels':
            await handleListModels(context);
            break;
        case 'newConversation':
            agentLoop?.reset();
            flowManager.reset();
            break;
        case 'getState':
            sendStateToWebview(context);
            break;
    }
}

async function handleUserMessage(text: string, context: vscode.ExtensionContext): Promise<void> {
    try {
        const settings = getSettings();
        const provider = createLlmProvider(settings);
        const toolRegistry = createToolRegistry();
        const toolContext = createToolContext();

        // システムプロンプトを構築
        const systemPrompt = buildSystemPrompt(context);

        // AgentLoopを初期化（新規会話時のみ）
        if (!agentLoop || agentLoop.currentState === TaskState.COMPLETED || agentLoop.currentState === TaskState.ERROR) {
            const events: AgentLoopEvents = {
                onStateChange: (state) => {
                    webviewProvider.postMessage({ type: 'stateChange', state: taskStateToAgentState(state) });
                },
                onStreamChunk: (content) => {
                    webviewProvider.postMessage({ type: 'streamChunk', content });
                },
                onStreamEnd: () => {
                    webviewProvider.postMessage({ type: 'streamEnd' });
                },
                onToolCallStarted: (toolCall) => {
                    webviewProvider.postMessage({ type: 'toolCallStarted', toolCall });
                },
                onToolCallCompleted: (toolCallId, result, success) => {
                    webviewProvider.postMessage({ type: 'toolCallCompleted', toolCallId, result, success });
                },
                onError: (error) => {
                    webviewProvider.postMessage({ type: 'error', error });
                },
                onComplete: (summary) => {
                    webviewProvider.postMessage({
                        type: 'stateChange',
                        state: 'completed',
                    });
                },
            };

            agentLoop = new AgentLoop(
                provider,
                toolRegistry,
                toolContext,
                systemPrompt,
                settings.agent.maxIterations,
                settings.agent.temperature,
                events,
            );
        }

        // ユーザーメッセージをWebviewに追加表示
        webviewProvider.postMessage({
            type: 'messageAdded',
            message: {
                id: `user-${Date.now()}`,
                role: 'user',
                content: text,
                timestamp: Date.now(),
            },
        });

        // エージェントループ実行
        await agentLoop.run(text);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        webviewProvider.postMessage({ type: 'error', error: errorMessage });
    }
}

async function handleTestConnection(context: vscode.ExtensionContext): Promise<void> {
    const settings = getSettings();
    const provider = createLlmProvider(settings);
    const result = await provider.testConnection();
    webviewProvider.postMessage({
        type: 'connectionStatus',
        connected: result.ok,
        error: result.error,
    });
}

async function handleListModels(context: vscode.ExtensionContext): Promise<void> {
    try {
        const settings = getSettings();
        const provider = createLlmProvider(settings);
        const models = await provider.listModels();
        webviewProvider.postMessage({
            type: 'modelList',
            models: models.map((m) => ({
                id: m.id,
                name: m.name,
                contextWindow: m.contextWindow,
                description: m.description,
            })),
        });
    } catch (error) {
        webviewProvider.postMessage({
            type: 'error',
            error: `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
}

// ============================================================
// ヘルパー関数
// ============================================================

function getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('mineagents');
    return {
        provider: {
            backendType: config.get<BackendType>('provider.backendType', 'ollama'),
            baseUrl: config.get<string>('provider.baseUrl', 'http://localhost:11434'),
            apiKey: config.get<string>('provider.apiKey', ''),
            modelId: config.get<string>('provider.modelId', ''),
        },
        agent: {
            maxIterations: config.get<number>('agent.maxIterations', 25),
            temperature: config.get<number>('agent.temperature', 0),
            interactionMode: config.get<'guide' | 'free' | 'template'>('agent.interactionMode', 'guide'),
        },
        stableDiffusion: {
            enabled: config.get<boolean>('stableDiffusion.enabled', false),
            baseUrl: config.get<string>('stableDiffusion.baseUrl', 'http://localhost:8188'),
        },
        approval: {
            autoApproveWrites: config.get<boolean>('approval.autoApproveWrites', false),
        },
    };
}

function createLlmProvider(settings: ExtensionSettings) {
    return providerRegistry.createProvider({
        backendType: settings.provider.backendType,
        baseUrl: settings.provider.baseUrl,
        apiKey: settings.provider.apiKey,
        modelId: settings.provider.modelId,
    });
}

function createToolRegistry(): ToolRegistry {
    const registry = new ToolRegistry();
    // 基本ツール
    registry.register(new ReadFileTool());
    registry.register(new WriteFileTool());
    registry.register(new ListFilesTool());
    registry.register(new AskUserTool());
    registry.register(new TaskCompleteTool());
    // MC Addon専用ツール
    registry.register(new CreateAddonProjectTool());
    registry.register(new AddItemTool());
    registry.register(new AddBlockTool());
    registry.register(new AddRecipeTool());
    // 検証・パッケージングツール
    registry.register(new ValidateAddonTool());
    registry.register(new PackageAddonTool());
    // ナレッジ検索ツール
    registry.register(new QueryKnowledgeTool(knowledgeEngine));
    // UI改変ツール
    registry.register(new CreateUiPackTool());
    return registry;
}

function createToolContext(): ToolContext {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
    return {
        workspaceRoot,
        askUser: async (question: string) => {
            const answer = await vscode.window.showInputBox({ prompt: question });
            return answer ?? '';
        },
        reportProgress: (step, total, description) => {
            webviewProvider.postMessage({
                type: 'progressUpdate',
                step,
                total,
                description,
            });
        },
        requestApproval: async (description, details, diff) => {
            // 自動承認設定チェック
            const settings = getSettings();
            if (settings.approval.autoApproveWrites) {
                return true;
            }
            // Webview経由で承認リクエスト
            const approvalId = `approval-${Date.now()}`;
            webviewProvider.postMessage({
                type: 'approvalRequired',
                approval: { id: approvalId, toolName: '', description, details, diff },
            });
            // TODO: 承認結果を待つ仕組みを実装
            return true; // 仮実装
        },
    };
}

function buildSystemPrompt(context: vscode.ExtensionContext): string {
    // KnowledgeEngine初期化（まだの場合）
    if (knowledgeEngine.listDocuments().length === 0) {
        knowledgeEngine.initialize(context.extensionPath);
    }

    // addon-expert.mdを読み込み
    const promptPath = path.join(context.extensionPath, 'src', 'core', 'prompts', 'templates', 'addon-expert.md');
    let systemPrompt = '';
    try {
        systemPrompt = fs.readFileSync(promptPath, 'utf-8');
    } catch {
        systemPrompt = getDefaultSystemPrompt();
    }

    // フェーズガイダンスを追加
    const phaseGuidance = flowManager.getPhaseGuidance();
    if (phaseGuidance) {
        systemPrompt += `\n\n## 現在のフェーズ指示\n${phaseGuidance}`;
    }

    // インタラクションモード情報を追加
    const settings = getSettings();
    systemPrompt += `\n\n## 現在のインタラクションモード: ${settings.agent.interactionMode}`;

    // ナレッジ鮮度レポート（古い情報があれば警告）
    const freshnessReport = knowledgeEngine.getFreshnessReport();
    if (freshnessReport.includes('⚠️')) {
        systemPrompt += `\n\n## ナレッジ鮮度警告\n${freshnessReport}`;
    }

    return systemPrompt;
}

function getDefaultSystemPrompt(): string {
    return `# Minecraft Bedrock Edition アドオン開発 専門家

あなたは統合版マインクラフト（Bedrock Edition）のアドオン開発の専門家エージェント「MineAgents」です。
リソースパックとビヘイビアパックの作成を支援します。

ユーザーの希望を聞き取り、実現可能なMinecraftアドオンを設計・生成してください。
実現不可能な要望には代替案を必ず提示してください。
承認を得てからファイルを生成してください。`;
}

function sendStateToWebview(context: vscode.ExtensionContext): void {
    const settings = getSettings();
    webviewProvider.postMessage({
        type: 'syncState',
        state: {
            agentState: agentLoop ? taskStateToAgentState(agentLoop.currentState) : 'idle',
            settings,
            conversationId: null,
            interactionMode: settings.agent.interactionMode,
        },
    });
}

function taskStateToAgentState(state: TaskState): string {
    switch (state) {
        case TaskState.IDLE: return 'idle';
        case TaskState.THINKING: return 'thinking';
        case TaskState.PARSING: return 'thinking';
        case TaskState.EXECUTING_TOOLS: return 'executing';
        case TaskState.WAITING_APPROVAL: return 'waiting_approval';
        case TaskState.WAITING_INPUT: return 'waiting_input';
        case TaskState.COMPLETED: return 'completed';
        case TaskState.CANCELLED: return 'idle';
        case TaskState.ERROR: return 'error';
        default: return 'idle';
    }
}
