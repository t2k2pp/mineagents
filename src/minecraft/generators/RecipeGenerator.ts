// ============================================================
// MineAgents - レシピジェネレーター
// Minecraft Bedrock クラフトレシピのJSON定義を生成
// ============================================================

export type RecipeType = 'shaped' | 'shapeless' | 'furnace';

export interface RecipeIngredient {
    item: string;      // 例: "minecraft:diamond" or "myaddon:ruby"
    count?: number;
}

export interface ShapedRecipeDefinition {
    type: 'shaped';
    identifier: string;
    pattern: string[];                           // 例: ["ABA", " C ", " C "]
    keys: Record<string, RecipeIngredient>;      // 例: { A: {item: "myaddon:ruby"}, B: {item: "minecraft:stick"} }
    result: RecipeIngredient;
    tags: string[];                              // 例: ["crafting_table"]
}

export interface ShapelessRecipeDefinition {
    type: 'shapeless';
    identifier: string;
    ingredients: RecipeIngredient[];
    result: RecipeIngredient;
    tags: string[];
}

export interface FurnaceRecipeDefinition {
    type: 'furnace';
    identifier: string;
    input: string;
    output: string;
    tags: string[];                              // 例: ["furnace", "blast_furnace"]
}

export type RecipeDefinition = ShapedRecipeDefinition | ShapelessRecipeDefinition | FurnaceRecipeDefinition;

export class RecipeGenerator {
    /**
     * レシピのBP定義JSONを生成
     */
    generate(def: RecipeDefinition): Record<string, unknown> {
        switch (def.type) {
            case 'shaped':
                return this.generateShaped(def);
            case 'shapeless':
                return this.generateShapeless(def);
            case 'furnace':
                return this.generateFurnace(def);
        }
    }

    private generateShaped(def: ShapedRecipeDefinition): Record<string, unknown> {
        const key: Record<string, { item: string; data?: number }> = {};
        for (const [k, v] of Object.entries(def.keys)) {
            key[k] = { item: v.item };
        }

        return {
            format_version: '1.21.0',
            'minecraft:recipe_shaped': {
                description: {
                    identifier: def.identifier,
                },
                tags: def.tags.length > 0 ? def.tags : ['crafting_table'],
                pattern: def.pattern,
                key,
                result: {
                    item: def.result.item,
                    count: def.result.count ?? 1,
                },
            },
        };
    }

    private generateShapeless(def: ShapelessRecipeDefinition): Record<string, unknown> {
        return {
            format_version: '1.21.0',
            'minecraft:recipe_shapeless': {
                description: {
                    identifier: def.identifier,
                },
                tags: def.tags.length > 0 ? def.tags : ['crafting_table'],
                ingredients: def.ingredients.map((i) => ({ item: i.item, count: i.count ?? 1 })),
                result: {
                    item: def.result.item,
                    count: def.result.count ?? 1,
                },
            },
        };
    }

    private generateFurnace(def: FurnaceRecipeDefinition): Record<string, unknown> {
        return {
            format_version: '1.21.0',
            'minecraft:recipe_furnace': {
                description: {
                    identifier: def.identifier,
                },
                tags: def.tags.length > 0 ? def.tags : ['furnace'],
                input: def.input,
                output: def.output,
            },
        };
    }
}
