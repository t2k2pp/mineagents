// ============================================================
// MineAgents - ask_user ツール
// ============================================================

import { Tool, ToolContext, ToolResult } from '../types';

export class AskUserTool implements Tool {
    readonly name = 'ask_user';
    readonly description = 'ユーザーに質問して回答を得ます。不明点の確認や、選択肢の提示に使用します。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            question: { type: 'string', description: 'ユーザーへの質問文' },
        },
        required: ['question'],
    };

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const question = params.question as string;
        const answer = await context.askUser(question);
        return {
            success: true,
            output: answer || '(ユーザーが回答をキャンセルしました)',
        };
    }
}
