// ============================================================
// MineAgents - add_item ツール
// カスタムアイテムをアドオンプロジェクトに追加
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { ItemGenerator, ItemDefinition } from '../generators/ItemGenerator';

export class AddItemTool implements Tool {
    readonly name = 'add_item';
    readonly description = 'カスタムアイテム（武器・防具・食料・道具等）をアドオンプロジェクトに追加します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'プロジェクトディレクトリパス' },
            namespace: { type: 'string', description: 'アドオンの名前空間' },
            itemName: { type: 'string', description: 'アイテム名（英語小文字、例: ruby_sword）' },
            displayName: { type: 'string', description: '表示名（例: ルビーソード）' },
            category: { type: 'string', enum: ['weapon', 'armor', 'food', 'tool', 'misc'], description: 'カテゴリ' },
            attackDamage: { type: 'number', description: '攻撃力' },
            durability: { type: 'number', description: '耐久値' },
            nutrition: { type: 'number', description: '食料回復値' },
            saturation: { type: 'number', description: '食料満腹度' },
            wearableSlot: { type: 'string', description: '装備スロット' },
            protection: { type: 'number', description: '防御値' },
            maxStackSize: { type: 'number', description: '最大スタック数' },
        },
        required: ['projectPath', 'namespace', 'itemName', 'displayName', 'category'],
    };

    private itemGen = new ItemGenerator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const projectPath = path.resolve(context.workspaceRoot, params.projectPath as string);
        const namespace = params.namespace as string;
        const itemName = params.itemName as string;

        const def: ItemDefinition = {
            identifier: `${namespace}:${itemName}`,
            displayName: params.displayName as string,
            category: params.category as ItemDefinition['category'],
            textureName: itemName,
            attackDamage: params.attackDamage as number | undefined,
            durability: params.durability as number | undefined,
            nutrition: params.nutrition as number | undefined,
            saturation: params.saturation as number | undefined,
            wearableSlot: params.wearableSlot as ItemDefinition['wearableSlot'],
            protection: params.protection as number | undefined,
            maxStackSize: params.maxStackSize as number | undefined,
        };

        try {
            const bpDir = path.join(projectPath, `${namespace}_BP`);
            const rpDir = path.join(projectPath, `${namespace}_RP`);

            // アイテム定義JSON
            const itemJson = this.itemGen.generateBehaviorPack(def);
            const itemPath = path.join(bpDir, 'items', `${itemName}.json`);
            fs.mkdirSync(path.dirname(itemPath), { recursive: true });
            fs.writeFileSync(itemPath, JSON.stringify(itemJson, null, 4));

            // item_texture.jsonにエントリ追加
            const texMapPath = path.join(rpDir, 'textures', 'item_texture.json');
            if (fs.existsSync(texMapPath)) {
                const texMap = JSON.parse(fs.readFileSync(texMapPath, 'utf-8'));
                const entry = this.itemGen.generateTextureEntry(def);
                texMap.texture_data = { ...texMap.texture_data, ...entry };
                fs.writeFileSync(texMapPath, JSON.stringify(texMap, null, 4));
            }

            // 言語ファイルに追加
            const langPath = path.join(rpDir, 'texts', 'ja_JP.lang');
            if (fs.existsSync(langPath)) {
                const langEntry = this.itemGen.generateLangEntry(def);
                fs.appendFileSync(langPath, `${langEntry}\n`);
            }

            return {
                success: true,
                output: `アイテム「${def.displayName}」(${def.identifier})を追加しました:\n  📄 ${path.relative(context.workspaceRoot, itemPath)}`,
                metadata: { identifier: def.identifier, itemName, files: [itemPath] },
            };
        } catch (error) {
            return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
