// ============================================================
// MineAgents - エージェントループ
// LLM ↔ ツール実行の自律的ループ
// ============================================================

import {
    LlmProvider,
    ChatMessage,
    ToolCall,
    CompletionChunk,
} from '../llm/LlmProvider';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ToolExecutor, ToolExecutionRequest } from '../tools/ToolExecutor';
import { ToolContext } from '../tools/types';

// ============================================================
// 状態マシン
// ============================================================

export enum TaskState {
    IDLE = 'idle',
    THINKING = 'thinking',
    PARSING = 'parsing',
    EXECUTING_TOOLS = 'executing_tools',
    WAITING_APPROVAL = 'waiting_approval',
    WAITING_INPUT = 'waiting_input',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    ERROR = 'error',
}

// ============================================================
// イベント型
// ============================================================

export interface AgentLoopEvents {
    onStateChange: (state: TaskState) => void;
    onStreamChunk: (content: string) => void;
    onStreamEnd: () => void;
    onToolCallStarted: (toolCall: { id: string; name: string; parameters: Record<string, unknown> }) => void;
    onToolCallCompleted: (toolCallId: string, result: string, success: boolean) => void;
    onError: (error: string) => void;
    onComplete: (summary: string) => void;
}

// ============================================================
// AgentLoop 本体
// ============================================================

export class AgentLoop {
    private state: TaskState = TaskState.IDLE;
    private iterationCount = 0;
    private conversationHistory: ChatMessage[] = [];
    private cancelled = false;
    private toolExecutor: ToolExecutor;

    constructor(
        private llmProvider: LlmProvider,
        private toolRegistry: ToolRegistry,
        private toolContext: ToolContext,
        private systemPrompt: string,
        private maxIterations: number,
        private temperature: number,
        private events: AgentLoopEvents,
    ) {
        this.toolExecutor = new ToolExecutor(toolRegistry, toolContext);
    }

    /** エージェントループを開始 */
    async run(userMessage: string): Promise<void> {
        this.cancelled = false;
        this.iterationCount = 0;

        // システムプロンプトが未設定なら追加
        if (this.conversationHistory.length === 0) {
            this.conversationHistory.push({
                role: 'system',
                content: this.systemPrompt,
            });
        }

        // ユーザーメッセージを追加
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
        });

        await this.agentLoop();
    }

    /** キャンセル */
    cancel(): void {
        this.cancelled = true;
        this.setState(TaskState.CANCELLED);
    }

    /** 会話履歴をリセット */
    reset(): void {
        this.conversationHistory = [];
        this.iterationCount = 0;
        this.setState(TaskState.IDLE);
    }

    /** 会話履歴を取得 */
    getHistory(): ChatMessage[] {
        return [...this.conversationHistory];
    }

    // ============================================================
    // プライベートメソッド
    // ============================================================

    private async agentLoop(): Promise<void> {
        while (this.iterationCount < this.maxIterations && !this.cancelled) {
            this.iterationCount++;

            try {
                // 1. LLMにストリーミング送信
                this.setState(TaskState.THINKING);

                const { textContent, toolCalls } = await this.streamCompletion();

                if (this.cancelled) return;

                // 2. アシスタント応答を履歴に追加
                this.conversationHistory.push({
                    role: 'assistant',
                    content: textContent || null,
                    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                });

                // 3. ツール呼び出しがあれば実行
                if (toolCalls.length > 0) {
                    this.setState(TaskState.EXECUTING_TOOLS);

                    const requests: ToolExecutionRequest[] = toolCalls.map((tc) => ({
                        toolCallId: tc.id,
                        toolName: tc.function.name,
                        arguments: JSON.parse(tc.function.arguments),
                    }));

                    const results = await this.toolExecutor.executeAll(requests);

                    // ツール結果を履歴に追加
                    for (const result of results) {
                        this.conversationHistory.push({
                            role: 'tool',
                            tool_call_id: result.toolCallId,
                            content: result.result.output,
                        });

                        this.events.onToolCallCompleted(
                            result.toolCallId,
                            result.result.output,
                            result.result.success,
                        );
                    }

                    // task_complete が呼ばれたら終了
                    if (results.some((r) => r.toolName === 'task_complete')) {
                        this.setState(TaskState.COMPLETED);
                        const summary = results.find((r) => r.toolName === 'task_complete')?.result.output ?? '';
                        this.events.onComplete(summary);
                        return;
                    }

                    continue; // ループ継続
                }

                // 4. ツール呼び出しなし → 最終応答
                this.setState(TaskState.COMPLETED);
                this.events.onComplete(textContent || '');
                return;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.setState(TaskState.ERROR);
                this.events.onError(errorMessage);
                return;
            }
        }

        if (!this.cancelled && this.iterationCount >= this.maxIterations) {
            this.events.onError(`Maximum iterations (${this.maxIterations}) reached.`);
            this.setState(TaskState.ERROR);
        }
    }

    private async streamCompletion(): Promise<{ textContent: string; toolCalls: ToolCall[] }> {
        const tools = this.toolRegistry.getToolSchemas();

        const stream = this.llmProvider.streamCompletion({
            messages: this.conversationHistory,
            tools: tools.length > 0 ? tools : undefined,
            temperature: this.temperature,
        });

        let textContent = '';
        const toolCalls: ToolCall[] = [];

        for await (const chunk of stream) {
            if (this.cancelled) break;

            if (chunk.content) {
                textContent += chunk.content;
                this.events.onStreamChunk(chunk.content);
            }

            if (chunk.toolCalls) {
                for (const tc of chunk.toolCalls) {
                    // ストリーミング中のtool_callを蓄積
                    const existing = toolCalls.find((t) => t.id === tc.id);
                    if (existing) {
                        existing.function.arguments += tc.function.arguments;
                    } else {
                        toolCalls.push({ ...tc });
                        this.events.onToolCallStarted({
                            id: tc.id,
                            name: tc.function.name,
                            parameters: {},
                        });
                    }
                }
            }

            if (chunk.done) {
                this.events.onStreamEnd();
            }
        }

        return { textContent, toolCalls };
    }

    private setState(state: TaskState): void {
        this.state = state;
        this.events.onStateChange(state);
    }

    get currentState(): TaskState {
        return this.state;
    }
}
