// ============================================================
// MineAgents - list_files ツール
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../types';

export class ListFilesTool implements Tool {
    readonly name = 'list_files';
    readonly description = 'ディレクトリ内のファイルとサブディレクトリの一覧を取得します。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'ディレクトリパス（ワークスペースからの相対パス、省略でルート）' },
            recursive: { type: 'boolean', description: '再帰的に一覧を取得するか（デフォルト: false）' },
        },
    };

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const dirPath = (params.path as string | undefined) ?? '.';
        const recursive = (params.recursive as boolean | undefined) ?? false;
        const absolutePath = path.resolve(context.workspaceRoot, dirPath);

        if (!absolutePath.startsWith(context.workspaceRoot)) {
            return { success: false, output: 'Error: Path is outside workspace.' };
        }

        try {
            const entries = this.listEntries(absolutePath, context.workspaceRoot, recursive, 0);
            return {
                success: true,
                output: entries.join('\n'),
                metadata: { count: entries.length },
            };
        } catch (error) {
            return { success: false, output: `Error listing files: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    private listEntries(dirPath: string, workspaceRoot: string, recursive: boolean, depth: number): string[] {
        const entries: string[] = [];
        const maxDepth = 5;
        const maxEntries = 200;

        if (depth > maxDepth || entries.length > maxEntries) return entries;

        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of items) {
            if (entries.length >= maxEntries) break;

            // node_modules, .git 等はスキップ
            if (item.name === 'node_modules' || item.name === '.git') continue;

            const relativePath = path.relative(workspaceRoot, path.join(dirPath, item.name));
            const prefix = item.isDirectory() ? '📁 ' : '📄 ';
            entries.push(`${prefix}${relativePath}`);

            if (recursive && item.isDirectory()) {
                entries.push(...this.listEntries(
                    path.join(dirPath, item.name),
                    workspaceRoot,
                    true,
                    depth + 1,
                ));
            }
        }

        return entries;
    }
}
