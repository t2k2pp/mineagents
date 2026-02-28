// ============================================================
// MineAgents - ツール実行ディスパッチャ
// ツール呼び出しの実行・承認フロー管理
// ============================================================

import { Tool, ToolContext, ToolResult } from './types';
import { ToolRegistry } from './ToolRegistry';

export interface ToolExecutionRequest {
    toolCallId: string;
    toolName: string;
    arguments: Record<string, unknown>;
}

export interface ToolExecutionResult {
    toolCallId: string;
    toolName: string;
    result: ToolResult;
}

export class ToolExecutor {
    constructor(
        private registry: ToolRegistry,
        private context: ToolContext,
    ) { }

    /** ツール呼び出しを実行 */
    async execute(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
        const tool = this.registry.get(request.toolName);

        if (!tool) {
            return {
                toolCallId: request.toolCallId,
                toolName: request.toolName,
                result: {
                    success: false,
                    output: `Unknown tool: ${request.toolName}`,
                },
            };
        }

        // 承認チェック
        if (tool.requiresApproval) {
            const approved = await this.context.requestApproval(
                `ツール実行: ${tool.name}`,
                this.formatToolCallDescription(tool, request.arguments),
            );
            if (!approved) {
                return {
                    toolCallId: request.toolCallId,
                    toolName: request.toolName,
                    result: {
                        success: false,
                        output: 'User rejected the action.',
                    },
                };
            }
        }

        // ツール実行
        try {
            const result = await tool.execute(request.arguments, this.context);
            return {
                toolCallId: request.toolCallId,
                toolName: request.toolName,
                result,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                toolCallId: request.toolCallId,
                toolName: request.toolName,
                result: {
                    success: false,
                    output: `Tool execution error: ${errorMessage}`,
                },
            };
        }
    }

    /** 複数のツール呼び出しを順次実行 */
    async executeAll(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]> {
        const results: ToolExecutionResult[] = [];
        for (const request of requests) {
            const result = await this.execute(request);
            results.push(result);
        }
        return results;
    }

    private formatToolCallDescription(tool: Tool, args: Record<string, unknown>): string {
        const lines = [`ツール: ${tool.name}`, `説明: ${tool.description}`, `パラメータ:`];
        for (const [key, value] of Object.entries(args)) {
            lines.push(`  ${key}: ${JSON.stringify(value)}`);
        }
        return lines.join('\n');
    }
}
