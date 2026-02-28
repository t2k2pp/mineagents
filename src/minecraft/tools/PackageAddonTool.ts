// ============================================================
// MineAgents - package_addon ツール
// ============================================================

import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { McpackBuilder } from '../packaging/McpackBuilder';

export class PackageAddonTool implements Tool {
    readonly name = 'package_addon';
    readonly description = 'アドオンを .mcaddon または .mcpack 形式にパッケージ化します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'プロジェクトディレクトリパス' },
            namespace: { type: 'string', description: 'アドオンの名前空間' },
            outputName: { type: 'string', description: '出力ファイル名（拡張子なし）' },
            type: { type: 'string', enum: ['mcaddon', 'mcpack_rp', 'mcpack_bp'], description: 'パッケージタイプ' },
        },
        required: ['projectPath', 'namespace', 'outputName'],
    };

    private builder = new McpackBuilder();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const projectPath = path.resolve(context.workspaceRoot, params.projectPath as string);
        const namespace = params.namespace as string;
        const outputName = params.outputName as string;
        const type = (params.type as string) ?? 'mcaddon';

        try {
            let outputPath: string;

            if (type === 'mcaddon') {
                const rpDir = path.join(projectPath, `${namespace}_RP`);
                const bpDir = path.join(projectPath, `${namespace}_BP`);
                outputPath = path.join(projectPath, `${outputName}.mcaddon`);
                await this.builder.buildMcaddon(rpDir, bpDir, outputPath);
            } else if (type === 'mcpack_rp') {
                const rpDir = path.join(projectPath, `${namespace}_RP`);
                outputPath = path.join(projectPath, `${outputName}_RP.mcpack`);
                await this.builder.buildMcpack(rpDir, outputPath);
            } else {
                const bpDir = path.join(projectPath, `${namespace}_BP`);
                outputPath = path.join(projectPath, `${outputName}_BP.mcpack`);
                await this.builder.buildMcpack(bpDir, outputPath);
            }

            return {
                success: true,
                output: `パッケージを作成しました: ${path.relative(context.workspaceRoot, outputPath)}`,
                metadata: { outputPath, type },
            };
        } catch (error) {
            return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
