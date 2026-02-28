// ============================================================
// MineAgents - read_file ツール
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../types';

export class ReadFileTool implements Tool {
    readonly name = 'read_file';
    readonly description = 'ファイルの内容を読み取ります。行範囲の指定も可能です。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'ファイルパス（ワークスペースからの相対パス）' },
            startLine: { type: 'number', description: '開始行（1-indexed、省略可）' },
            endLine: { type: 'number', description: '終了行（1-indexed、省略可）' },
        },
        required: ['path'],
    };

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const filePath = params.path as string;
        const absolutePath = path.resolve(context.workspaceRoot, filePath);

        // ワークスペース外アクセス防止
        if (!absolutePath.startsWith(context.workspaceRoot)) {
            return { success: false, output: 'Error: Path is outside workspace.' };
        }

        try {
            const content = fs.readFileSync(absolutePath, 'utf-8');
            const lines = content.split('\n');
            const startLine = (params.startLine as number | undefined) ?? 1;
            const endLine = (params.endLine as number | undefined) ?? lines.length;
            const selected = lines.slice(startLine - 1, endLine).join('\n');

            return {
                success: true,
                output: selected,
                metadata: { totalLines: lines.length, range: `${startLine}-${endLine}` },
            };
        } catch (error) {
            return { success: false, output: `Error reading file: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
