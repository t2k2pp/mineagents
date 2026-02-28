// ============================================================
// MineAgents - add_recipe ツール
// クラフトレシピをアドオンプロジェクトに追加
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { RecipeGenerator, RecipeDefinition } from '../generators/RecipeGenerator';

export class AddRecipeTool implements Tool {
    readonly name = 'add_recipe';
    readonly description = 'クラフトレシピ（作業台・かまど等）をアドオンプロジェクトに追加します。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            projectPath: { type: 'string', description: 'プロジェクトディレクトリパス' },
            namespace: { type: 'string', description: 'アドオンの名前空間' },
            recipeName: { type: 'string', description: 'レシピ名（英語小文字、例: ruby_sword_recipe）' },
            recipeType: { type: 'string', enum: ['shaped', 'shapeless', 'furnace'], description: 'レシピタイプ' },
            pattern: { type: 'array', items: { type: 'string' }, description: 'shapedレシピのパターン（例: ["ABA", " C ", " C "]）' },
            keys: { type: 'object', description: 'パターンキーとアイテムの対応（例: {"A": "myaddon:ruby", "B": "myaddon:stick"}）' },
            ingredients: { type: 'array', description: 'shapelessレシピの材料リスト' },
            input: { type: 'string', description: 'furnaceの入力アイテム' },
            resultItem: { type: 'string', description: '結果アイテム' },
            resultCount: { type: 'number', description: '結果個数' },
        },
        required: ['projectPath', 'namespace', 'recipeName', 'recipeType', 'resultItem'],
    };

    private recipeGen = new RecipeGenerator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const projectPath = path.resolve(context.workspaceRoot, params.projectPath as string);
        const namespace = params.namespace as string;
        const recipeName = params.recipeName as string;
        const recipeType = params.recipeType as string;

        try {
            const bpDir = path.join(projectPath, `${namespace}_BP`);
            let recipeDef: RecipeDefinition;

            if (recipeType === 'shaped') {
                const keys: Record<string, { item: string }> = {};
                const rawKeys = (params.keys as Record<string, string>) ?? {};
                for (const [k, v] of Object.entries(rawKeys)) {
                    keys[k] = { item: v };
                }
                recipeDef = {
                    type: 'shaped',
                    identifier: `${namespace}:${recipeName}`,
                    pattern: (params.pattern as string[]) ?? ['   ', '   ', '   '],
                    keys,
                    result: { item: params.resultItem as string, count: (params.resultCount as number) ?? 1 },
                    tags: ['crafting_table'],
                };
            } else if (recipeType === 'shapeless') {
                const rawIngredients = (params.ingredients as string[]) ?? [];
                recipeDef = {
                    type: 'shapeless',
                    identifier: `${namespace}:${recipeName}`,
                    ingredients: rawIngredients.map((i) => ({ item: i })),
                    result: { item: params.resultItem as string, count: (params.resultCount as number) ?? 1 },
                    tags: ['crafting_table'],
                };
            } else {
                recipeDef = {
                    type: 'furnace',
                    identifier: `${namespace}:${recipeName}`,
                    input: params.input as string,
                    output: params.resultItem as string,
                    tags: ['furnace'],
                };
            }

            const recipeJson = this.recipeGen.generate(recipeDef);
            const recipePath = path.join(bpDir, 'recipes', `${recipeName}.json`);
            fs.mkdirSync(path.dirname(recipePath), { recursive: true });
            fs.writeFileSync(recipePath, JSON.stringify(recipeJson, null, 4));

            return {
                success: true,
                output: `レシピ「${recipeName}」(${recipeType})を追加しました:\n  📄 ${path.relative(context.workspaceRoot, recipePath)}`,
                metadata: { recipeName, recipeType, files: [recipePath] },
            };
        } catch (error) {
            return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}
