// ============================================================
// MineAgents - write_file ツール
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../types';

export class WriteFileTool implements Tool {
    readonly name = 'write_file';
    readonly description = 'ファイルを新規作成または上書きします。親ディレクトリが存在しない場合は自動で作成します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'ファイルパス（ワークスペースからの相対パス）' },
            content: { type: 'string', description: 'ファイルの内容' },
        },
        required: ['path', 'content'],
    };

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const filePath = params.path as string;
        const content = params.content as string;
        const absolutePath = path.resolve(context.workspaceRoot, filePath);

        if (!absolutePath.startsWith(context.workspaceRoot)) {
            return { success: false, output: 'Error: Path is outside workspace.' };
        }

        try {
            // 親ディレクトリを自動作成
            const dir = path.dirname(absolutePath);
            fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(absolutePath, content, 'utf-8');
            return {
                success: true,
                output: `File written: ${filePath} (${content.length} chars)`,
                metadata: { path: filePath, size: content.length },
            };
        } catch (error) {
            return { success: false, output: `Error writing file: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
