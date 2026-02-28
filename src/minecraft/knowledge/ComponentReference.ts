// ============================================================
// MineAgents - Bedrock コンポーネントリファレンスDB
// エンティティ・ブロック・アイテムの利用可能コンポーネント一覧
// ============================================================

export interface ComponentInfo {
    id: string;
    description: string;
    type: 'entity' | 'block' | 'item';
    category: string;
    parameters?: Record<string, { type: string; description: string; default?: unknown }>;
    since?: string; // format_version
}

/**
 * エンティティコンポーネント（サーバーサイド）の主要リファレンス
 */
export const ENTITY_COMPONENTS: ComponentInfo[] = [
    { id: 'minecraft:health', description: '体力を設定', type: 'entity', category: '属性', parameters: { value: { type: 'number', description: '最大HP', default: 10 }, max: { type: 'number', description: '最大HP', default: 10 } } },
    { id: 'minecraft:attack', description: '近接攻撃を設定', type: 'entity', category: '戦闘', parameters: { damage: { type: 'number', description: '攻撃力', default: 2 } } },
    { id: 'minecraft:movement', description: '移動速度を設定', type: 'entity', category: '移動', parameters: { value: { type: 'number', description: '移動速度', default: 0.25 } } },
    { id: 'minecraft:movement.basic', description: '基本的な地上移動', type: 'entity', category: '移動' },
    { id: 'minecraft:movement.fly', description: '飛行移動', type: 'entity', category: '移動' },
    { id: 'minecraft:movement.swim', description: '水中移動', type: 'entity', category: '移動' },
    { id: 'minecraft:navigation.walk', description: '地上パスファインディング', type: 'entity', category: 'AI' },
    { id: 'minecraft:navigation.fly', description: '飛行パスファインディング', type: 'entity', category: 'AI' },
    { id: 'minecraft:behavior.melee_attack', description: '近接攻撃行動', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:behavior.follow_owner', description: 'オーナーを追従', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:behavior.random_stroll', description: 'ランダム歩行', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:behavior.look_at_player', description: 'プレイヤーを見る', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:behavior.hurt_by_target', description: '攻撃者をターゲット', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:behavior.nearest_attackable_target', description: '最寄りの攻撃可能ターゲット', type: 'entity', category: 'AI行動' },
    { id: 'minecraft:tameable', description: 'テイム可能にする', type: 'entity', category: '特性' },
    { id: 'minecraft:rideable', description: '騎乗可能にする', type: 'entity', category: '特性' },
    { id: 'minecraft:loot', description: 'ドロップアイテム設定', type: 'entity', category: 'ドロップ', parameters: { table: { type: 'string', description: 'ルートテーブルパス' } } },
    { id: 'minecraft:scale', description: 'サイズ倍率', type: 'entity', category: '属性', parameters: { value: { type: 'number', description: '倍率', default: 1.0 } } },
    { id: 'minecraft:type_family', description: 'エンティティファミリー設定', type: 'entity', category: '属性' },
    { id: 'minecraft:physics', description: '物理演算を有効化', type: 'entity', category: '属性' },
    { id: 'minecraft:pushable', description: 'プッシュ可否', type: 'entity', category: '属性' },
    { id: 'minecraft:collision_box', description: '当たり判定', type: 'entity', category: '属性', parameters: { width: { type: 'number', description: '幅', default: 0.6 }, height: { type: 'number', description: '高さ', default: 1.8 } } },
];

/**
 * アイテムコンポーネントの主要リファレンス
 */
export const ITEM_COMPONENTS: ComponentInfo[] = [
    { id: 'minecraft:icon', description: 'アイテムアイコン', type: 'item', category: '表示', parameters: { texture: { type: 'string', description: 'テクスチャ名' } } },
    { id: 'minecraft:display_name', description: '表示名', type: 'item', category: '表示', parameters: { value: { type: 'string', description: '表示名キー' } } },
    { id: 'minecraft:max_stack_size', description: '最大スタック数', type: 'item', category: '属性', parameters: { value: { type: 'number', description: 'スタック数', default: 64 } } },
    { id: 'minecraft:damage', description: '攻撃ダメージ', type: 'item', category: '戦闘', parameters: { value: { type: 'number', description: 'ダメージ値' } }, since: '1.21.0' },
    { id: 'minecraft:durability', description: '耐久値', type: 'item', category: '属性', parameters: { max_durability: { type: 'number', description: '最大耐久値' } } },
    { id: 'minecraft:hand_equipped', description: '手持ち表示', type: 'item', category: '表示', parameters: { value: { type: 'boolean', description: '3D表示するか', default: true } } },
    { id: 'minecraft:enchantable', description: 'エンチャント可能', type: 'item', category: '属性', parameters: { value: { type: 'number', description: 'エンチャント値', default: 10 }, slot: { type: 'string', description: 'スロット' } } },
    { id: 'minecraft:food', description: '食料として使用可能', type: 'item', category: '食料', parameters: { nutrition: { type: 'number', description: '回復値' }, saturation_modifier: { type: 'number', description: '満腹度' } } },
    { id: 'minecraft:wearable', description: '装備可能', type: 'item', category: '防具', parameters: { slot: { type: 'string', description: '装備スロット' }, protection: { type: 'number', description: '防御値' } } },
    { id: 'minecraft:cooldown', description: '使用クールダウン', type: 'item', category: '属性', parameters: { category: { type: 'string', description: 'カテゴリ' }, duration: { type: 'number', description: '秒数' } } },
];

/**
 * ブロックコンポーネントの主要リファレンス
 */
export const BLOCK_COMPONENTS: ComponentInfo[] = [
    { id: 'minecraft:destructible_by_mining', description: '採掘で破壊可能', type: 'block', category: '属性', parameters: { seconds_to_destroy: { type: 'number', description: '破壊時間(秒)', default: 3.0 } } },
    { id: 'minecraft:destructible_by_explosion', description: '爆発で破壊可能', type: 'block', category: '属性', parameters: { explosion_resistance: { type: 'number', description: '爆発耐性', default: 3.0 } } },
    { id: 'minecraft:friction', description: '摩擦係数', type: 'block', category: '属性', parameters: { value: { type: 'number', description: '摩擦値', default: 0.6 } } },
    { id: 'minecraft:light_emission', description: '発光量', type: 'block', category: '属性', parameters: { emission: { type: 'number', description: '光量(0-15)', default: 0 } } },
    { id: 'minecraft:light_dampening', description: '遮光量', type: 'block', category: '属性', parameters: { value: { type: 'number', description: '遮光量(0-15)', default: 15 } } },
    { id: 'minecraft:map_color', description: 'マップ上の色', type: 'block', category: '表示', parameters: { value: { type: 'string', description: 'カラーコード' } } },
    { id: 'minecraft:geometry', description: 'カスタム形状', type: 'block', category: '形状', parameters: { identifier: { type: 'string', description: 'ジオメトリID' } } },
    { id: 'minecraft:material_instances', description: 'テクスチャ・マテリアル設定', type: 'block', category: '表示' },
    { id: 'minecraft:collision_box', description: '当たり判定', type: 'block', category: '形状' },
    { id: 'minecraft:selection_box', description: '選択判定', type: 'block', category: '形状' },
    { id: 'minecraft:loot', description: 'ドロップ設定', type: 'block', category: 'ドロップ', parameters: { table: { type: 'string', description: 'ルートテーブルパス' } } },
    { id: 'minecraft:crafting_table', description: 'クラフト台として機能', type: 'block', category: '機能' },
    { id: 'minecraft:flammable', description: '可燃性', type: 'block', category: '属性' },
];

/**
 * コンポーネントを検索する
 */
export function findComponents(type: 'entity' | 'block' | 'item', query?: string): ComponentInfo[] {
    const allComponents = type === 'entity' ? ENTITY_COMPONENTS
        : type === 'item' ? ITEM_COMPONENTS
            : BLOCK_COMPONENTS;

    if (!query) return allComponents;

    const lowerQuery = query.toLowerCase();
    return allComponents.filter(
        (c) => c.id.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery) ||
            c.category.toLowerCase().includes(lowerQuery),
    );
}

/**
 * コンポーネント一覧をフォーマット
 */
export function formatComponentList(components: ComponentInfo[]): string {
    const byCategory = new Map<string, ComponentInfo[]>();
    for (const c of components) {
        const list = byCategory.get(c.category) || [];
        list.push(c);
        byCategory.set(c.category, list);
    }

    const lines: string[] = [];
    for (const [category, comps] of byCategory) {
        lines.push(`\n### ${category}`);
        for (const c of comps) {
            lines.push(`- \`${c.id}\` - ${c.description}`);
        }
    }
    return lines.join('\n');
}
