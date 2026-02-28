// ============================================================
// MineAgents - アイテムジェネレーター
// Minecraft Bedrock カスタムアイテムのJSON定義を生成
// ============================================================

export interface ItemDefinition {
    /** 識別子（例: myaddon:ruby_sword） */
    identifier: string;
    /** 表示名 */
    displayName: string;
    /** カテゴリ */
    category: 'weapon' | 'armor' | 'food' | 'tool' | 'misc';
    /** テクスチャ名 */
    textureName: string;

    // 武器・道具プロパティ
    attackDamage?: number;
    durability?: number;
    enchantable?: { value: number; slot: string };

    // 食料プロパティ
    nutrition?: number;
    saturation?: number;

    // 防具プロパティ
    wearableSlot?: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet';
    protection?: number;

    // 共通
    maxStackSize?: number;
    handEquipped?: boolean;
    cooldown?: { category: string; duration: number };
}

export class ItemGenerator {
    /**
     * アイテムのBP定義 JSON を生成
     */
    generateBehaviorPack(def: ItemDefinition): Record<string, unknown> {
        const components: Record<string, unknown> = {};

        // アイコン
        components['minecraft:icon'] = { texture: def.textureName };

        // 表示名
        components['minecraft:display_name'] = { value: def.displayName };

        // スタック数
        if (def.maxStackSize !== undefined) {
            components['minecraft:max_stack_size'] = { value: def.maxStackSize };
        } else if (def.category === 'weapon' || def.category === 'tool' || def.category === 'armor') {
            components['minecraft:max_stack_size'] = { value: 1 };
        }

        // 手持ち表示
        if (def.handEquipped !== undefined) {
            components['minecraft:hand_equipped'] = { value: def.handEquipped };
        } else if (def.category === 'weapon' || def.category === 'tool') {
            components['minecraft:hand_equipped'] = { value: true };
        }

        // 攻撃力
        if (def.attackDamage !== undefined) {
            components['minecraft:damage'] = { value: def.attackDamage };
        }

        // 耐久値
        if (def.durability !== undefined) {
            components['minecraft:durability'] = {
                max_durability: def.durability,
            };
        }

        // エンチャント
        if (def.enchantable) {
            components['minecraft:enchantable'] = def.enchantable;
        }

        // 食料
        if (def.nutrition !== undefined) {
            components['minecraft:food'] = {
                nutrition: def.nutrition,
                saturation_modifier: def.saturation ?? 0.6,
                can_always_eat: false,
            };
        }

        // 防具
        if (def.wearableSlot) {
            components['minecraft:wearable'] = {
                slot: def.wearableSlot,
                protection: def.protection ?? 0,
            };
        }

        // クールダウン
        if (def.cooldown) {
            components['minecraft:cooldown'] = def.cooldown;
        }

        return {
            format_version: '1.21.0',
            'minecraft:item': {
                description: {
                    identifier: def.identifier,
                    menu_category: {
                        category: this.getMenuCategory(def.category),
                    },
                },
                components,
            },
        };
    }

    /**
     * アイテムテクスチャマッピング用 item_texture.json のエントリを生成
     */
    generateTextureEntry(def: ItemDefinition): Record<string, unknown> {
        return {
            [def.textureName]: {
                textures: `textures/items/${def.textureName}`,
            },
        };
    }

    /**
     * 言語ファイルエントリを生成
     */
    generateLangEntry(def: ItemDefinition): string {
        return `item.${def.identifier}.name=${def.displayName}`;
    }

    private getMenuCategory(category: string): string {
        switch (category) {
            case 'weapon': return 'equipment';
            case 'armor': return 'equipment';
            case 'tool': return 'equipment';
            case 'food': return 'nature';
            default: return 'items';
        }
    }
}
