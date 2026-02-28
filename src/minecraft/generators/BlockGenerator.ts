// ============================================================
// MineAgents - ブロックジェネレーター
// Minecraft Bedrock カスタムブロックのJSON定義を生成
// ============================================================

export interface BlockDefinition {
    /** 識別子（例: myaddon:ruby_block） */
    identifier: string;
    /** 表示名 */
    displayName: string;
    /** テクスチャ名 */
    textureName: string;

    // 物性
    destructibleByMining?: number;   // 破壊時間（秒）
    explosionResistance?: number;    // 爆発耐性
    friction?: number;               // 摩擦
    lightEmission?: number;          // 発光量（0-15）
    lightDampening?: number;         // 遮光量（0-15）
    mapColor?: string;               // マップ色

    // テクスチャ設定
    textureAllFaces?: boolean;       // 全面同一テクスチャ
    topTexture?: string;             // 上面テクスチャ
    bottomTexture?: string;          // 下面テクスチャ
    sideTexture?: string;            // 側面テクスチャ

    // 形状
    geometry?: string;               // カスタムジオメトリ
    flammable?: boolean;

    // ドロップ
    lootTable?: string;

    // メニュー
    menuCategory?: string;
}

export class BlockGenerator {
    /**
     * ブロックのBP定義 JSON を生成
     */
    generateBehaviorPack(def: BlockDefinition): Record<string, unknown> {
        const components: Record<string, unknown> = {};

        // 採掘破壊
        components['minecraft:destructible_by_mining'] = {
            seconds_to_destroy: def.destructibleByMining ?? 3.0,
        };

        // 爆発耐性
        components['minecraft:destructible_by_explosion'] = {
            explosion_resistance: def.explosionResistance ?? 3.0,
        };

        // 摩擦
        if (def.friction !== undefined) {
            components['minecraft:friction'] = { value: def.friction };
        }

        // 発光
        if (def.lightEmission !== undefined && def.lightEmission > 0) {
            components['minecraft:light_emission'] = { emission: def.lightEmission };
        }

        // 遮光
        if (def.lightDampening !== undefined) {
            components['minecraft:light_dampening'] = { value: def.lightDampening };
        }

        // マップ色
        if (def.mapColor) {
            components['minecraft:map_color'] = def.mapColor;
        }

        // テクスチャ（material_instances）
        components['minecraft:material_instances'] = {
            '*': {
                texture: def.textureName,
                render_method: 'opaque',
            },
        };

        // 面ごとのテクスチャ
        if (def.topTexture || def.bottomTexture || def.sideTexture) {
            const mi: Record<string, unknown> = {
                '*': { texture: def.sideTexture ?? def.textureName, render_method: 'opaque' },
            };
            if (def.topTexture) {
                mi['up'] = { texture: def.topTexture, render_method: 'opaque' };
            }
            if (def.bottomTexture) {
                mi['down'] = { texture: def.bottomTexture, render_method: 'opaque' };
            }
            components['minecraft:material_instances'] = mi;
        }

        // カスタム形状
        if (def.geometry) {
            components['minecraft:geometry'] = { identifier: def.geometry };
        }

        // 可燃性
        if (def.flammable) {
            components['minecraft:flammable'] = {
                catch_chance_modifier: 5,
                destroy_chance_modifier: 20,
            };
        }

        // ドロップ
        if (def.lootTable) {
            components['minecraft:loot'] = def.lootTable;
        }

        return {
            format_version: '1.21.0',
            'minecraft:block': {
                description: {
                    identifier: def.identifier,
                    menu_category: {
                        category: def.menuCategory ?? 'construction',
                    },
                },
                components,
            },
        };
    }

    /**
     * ブロックテクスチャマッピング用 terrain_texture.json のエントリを生成
     */
    generateTerrainTextureEntry(def: BlockDefinition): Record<string, unknown> {
        const entry: Record<string, unknown> = {
            [def.textureName]: {
                textures: `textures/blocks/${def.textureName}`,
            },
        };

        // 面別テクスチャがある場合は追加
        if (def.topTexture) {
            entry[def.topTexture] = { textures: `textures/blocks/${def.topTexture}` };
        }
        if (def.bottomTexture) {
            entry[def.bottomTexture] = { textures: `textures/blocks/${def.bottomTexture}` };
        }
        if (def.sideTexture) {
            entry[def.sideTexture] = { textures: `textures/blocks/${def.sideTexture}` };
        }

        return entry;
    }

    /**
     * 言語ファイルエントリを生成
     */
    generateLangEntry(def: BlockDefinition): string {
        return `tile.${def.identifier}.name=${def.displayName}`;
    }
}
