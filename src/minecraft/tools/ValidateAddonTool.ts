// ============================================================
// MineAgents - validate_addon ツール
// ============================================================

import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { AddonValidator } from '../validators/AddonValidator';

export class ValidateAddonTool implements Tool {
    readonly name = 'validate_addon';
    readonly description = 'アドオンプロジェクトの整合性を検証します。manifest.json、JSON構文、テクスチャ参照、識別子などをチェックします。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'プロジェクトディレクトリパス' },
            namespace: { type: 'string', description: 'アドオンの名前空間' },
        },
        required: ['projectPath', 'namespace'],
    };

    private validator = new AddonValidator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const projectPath = require('path').resolve(context.workspaceRoot, params.projectPath as string);
        const namespace = params.namespace as string;

        const result = this.validator.validate(projectPath, namespace);
        const output = this.validator.formatResult(result);

        return {
            success: result.valid,
            output,
            metadata: {
                errorCount: result.errors.length,
                warningCount: result.warnings.length,
            },
        };
    }
}
