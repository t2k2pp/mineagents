// ============================================================
// MineAgents - task_complete ツール
// ============================================================

import { Tool, ToolContext, ToolResult } from '../types';

export class TaskCompleteTool implements Tool {
    readonly name = 'task_complete';
    readonly description = 'タスクの完了を報告します。完了サマリーを含めてください。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            summary: { type: 'string', description: 'タスク完了のサマリー' },
        },
        required: ['summary'],
    };

    async execute(params: Record<string, unknown>, _context: ToolContext): Promise<ToolResult> {
        const summary = params.summary as string;
        return {
            success: true,
            output: summary,
        };
    }
}
