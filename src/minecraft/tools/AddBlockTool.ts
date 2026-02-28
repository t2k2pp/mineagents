// ============================================================
// MineAgents - add_block ツール
// カスタムブロックをアドオンプロジェクトに追加
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { BlockGenerator, BlockDefinition } from '../generators/BlockGenerator';

export class AddBlockTool implements Tool {
    readonly name = 'add_block';
    readonly description = 'カスタムブロック（装飾・光源・機能ブロック等）をアドオンプロジェクトに追加します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'プロジェクトディレクトリパス' },
            namespace: { type: 'string', description: 'アドオンの名前空間' },
            blockName: { type: 'string', description: 'ブロック名（英語小文字、例: ruby_block）' },
            displayName: { type: 'string', description: '表示名（例: ルビーブロック）' },
            destructibleByMining: { type: 'number', description: '破壊時間（秒）' },
            explosionResistance: { type: 'number', description: '爆発耐性' },
            lightEmission: { type: 'number', description: '発光量（0-15）' },
            mapColor: { type: 'string', description: 'マップ色（16進数）' },
            flammable: { type: 'boolean', description: '可燃性' },
        },
        required: ['projectPath', 'namespace', 'blockName', 'displayName'],
    };

    private blockGen = new BlockGenerator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const projectPath = path.resolve(context.workspaceRoot, params.projectPath as string);
        const namespace = params.namespace as string;
        const blockName = params.blockName as string;

        const def: BlockDefinition = {
            identifier: `${namespace}:${blockName}`,
            displayName: params.displayName as string,
            textureName: blockName,
            destructibleByMining: params.destructibleByMining as number | undefined,
            explosionResistance: params.explosionResistance as number | undefined,
            lightEmission: params.lightEmission as number | undefined,
            mapColor: params.mapColor as string | undefined,
            flammable: params.flammable as boolean | undefined,
        };

        try {
            const bpDir = path.join(projectPath, `${namespace}_BP`);
            const rpDir = path.join(projectPath, `${namespace}_RP`);

            // ブロック定義JSON
            const blockJson = this.blockGen.generateBehaviorPack(def);
            const blockPath = path.join(bpDir, 'blocks', `${blockName}.json`);
            fs.mkdirSync(path.dirname(blockPath), { recursive: true });
            fs.writeFileSync(blockPath, JSON.stringify(blockJson, null, 4));

            // terrain_texture.jsonにエントリ追加
            const texMapPath = path.join(rpDir, 'textures', 'terrain_texture.json');
            if (fs.existsSync(texMapPath)) {
                const texMap = JSON.parse(fs.readFileSync(texMapPath, 'utf-8'));
                const entry = this.blockGen.generateTerrainTextureEntry(def);
                texMap.texture_data = { ...texMap.texture_data, ...entry };
                fs.writeFileSync(texMapPath, JSON.stringify(texMap, null, 4));
            }

            // 言語ファイルに追加
            const langPath = path.join(rpDir, 'texts', 'ja_JP.lang');
            if (fs.existsSync(langPath)) {
                const langEntry = this.blockGen.generateLangEntry(def);
                fs.appendFileSync(langPath, `${langEntry}\n`);
            }

            return {
                success: true,
                output: `ブロック「${def.displayName}」(${def.identifier})を追加しました:\n  📄 ${path.relative(context.workspaceRoot, blockPath)}`,
                metadata: { identifier: def.identifier, blockName, files: [blockPath] },
            };
        } catch (error) {
            return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
