// ============================================================
// MineAgents - create_addon_project ツール
// アドオンプロジェクトのディレクトリ構造とmanifest.jsonを生成
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { ManifestGenerator } from '../generators/ManifestGenerator';

export class CreateAddonProjectTool implements Tool {
    readonly name = 'create_addon_project';
    readonly description = 'Minecraftアドオンの新規プロジェクトを作成します。RP/BPのディレクトリ構造とmanifest.jsonを自動生成します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'アドオン名（例: Ruby Addon）' },
            namespace: { type: 'string', description: '名前空間（例: ruby_addon）' },
            description: { type: 'string', description: 'アドオンの説明' },
            type: { type: 'string', enum: ['full', 'rp_only', 'bp_only'], description: 'パックタイプ（デフォルト: full）' },
        },
        required: ['name', 'namespace', 'description'],
    };

    private manifestGen = new ManifestGenerator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const name = params.name as string;
        const namespace = params.namespace as string;
        const description = params.description as string;
        const type = (params.type as string) ?? 'full';

        const projectDir = path.join(context.workspaceRoot, namespace);

        try {
            const createdFiles: string[] = [];

            if (type === 'full' || type === 'rp_only') {
                // リソースパック
                const rpDir = type === 'full' ? path.join(projectDir, `${namespace}_RP`) : projectDir;
                this.createRPStructure(rpDir);
                createdFiles.push(`${path.relative(context.workspaceRoot, rpDir)}/`);
            }

            if (type === 'full' || type === 'bp_only') {
                // ビヘイビアパック
                const bpDir = type === 'full' ? path.join(projectDir, `${namespace}_BP`) : projectDir;
                this.createBPStructure(bpDir);
                createdFiles.push(`${path.relative(context.workspaceRoot, bpDir)}/`);
            }

            // manifest.json生成
            const manifestOptions = {
                name,
                namespace,
                description,
                version: [1, 0, 0] as [number, number, number],
                minEngineVersion: [1, 21, 0] as [number, number, number],
            };

            if (type === 'full') {
                const manifests = this.manifestGen.generatePair(manifestOptions);
                const rpDir = path.join(projectDir, `${namespace}_RP`);
                const bpDir = path.join(projectDir, `${namespace}_BP`);
                fs.writeFileSync(path.join(rpDir, 'manifest.json'), JSON.stringify(manifests.resourcePack, null, 4));
                fs.writeFileSync(path.join(bpDir, 'manifest.json'), JSON.stringify(manifests.behaviorPack, null, 4));

                // item_texture.json初期化
                fs.writeFileSync(path.join(rpDir, 'textures', 'item_texture.json'), JSON.stringify({
                    resource_pack_name: name,
                    texture_name: 'atlas.items',
                    texture_data: {},
                }, null, 4));

                // terrain_texture.json初期化  
                fs.writeFileSync(path.join(rpDir, 'textures', 'terrain_texture.json'), JSON.stringify({
                    resource_pack_name: name,
                    texture_name: 'atlas.terrain',
                    texture_data: {},
                }, null, 4));

                // 言語ファイル初期化
                fs.writeFileSync(path.join(rpDir, 'texts', 'ja_JP.lang'), `## ${name}\n`);
                fs.writeFileSync(path.join(rpDir, 'texts', 'en_US.lang'), `## ${name}\n`);

            } else if (type === 'rp_only') {
                const manifest = this.manifestGen.generateResourcePackOnly(manifestOptions);
                fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifest, null, 4));
            } else {
                const manifest = this.manifestGen.generateBehaviorPackOnly(manifestOptions);
                fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifest, null, 4));
            }

            return {
                success: true,
                output: `プロジェクト「${name}」を作成しました:\n${createdFiles.map((f) => `  📁 ${f}`).join('\n')}`,
                metadata: { projectDir, namespace, type },
            };
        } catch (error) {
            return { success: false, output: `Error creating project: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    private createRPStructure(rpDir: string): void {
        const dirs = [
            'textures/items',
            'textures/blocks',
            'textures/entity',
            'models/entity',
            'texts',
            'sounds',
        ];
        for (const dir of dirs) {
            fs.mkdirSync(path.join(rpDir, dir), { recursive: true });
        }
    }

    private createBPStructure(bpDir: string): void {
        const dirs = [
            'items',
            'blocks',
            'entities',
            'recipes',
            'loot_tables',
            'spawn_rules',
            'trading',
            'functions',
        ];
        for (const dir of dirs) {
            fs.mkdirSync(path.join(bpDir, dir), { recursive: true });
        }
    }
}
