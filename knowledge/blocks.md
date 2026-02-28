---
id: blocks
title: ブロックコンポーネント全リファレンス
category: component
tags: [block, component, destructible, light, friction, geometry, material_instances, collision_box, selection_box, loot, crafting_table, flammable, map_color, ブロック, 光, 形状, テクスチャ]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# ブロックコンポーネント全リファレンス

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## 基本構造

```json
{
    "format_version": "1.21.0",
    "minecraft:block": {
        "description": {
            "identifier": "namespace:block_name",
            "menu_category": {
                "category": "construction",
                "group": "itemGroup.name.stone"
            },
            "traits": {},
            "states": {}
        },
        "components": {},
        "permutations": []
    }
}
```

## menu_category.category 有効値
`"construction"`, `"nature"`, `"equipment"`, `"items"`, `"none"`

## コンポーネント一覧

### minecraft:destructible_by_mining
- **用途**: 採掘での破壊時間
- **パラメータ**: `{ "seconds_to_destroy": number }`
- **バニラ参考値**: 土=0.5, 石=1.5, 黒曜石=50, ダイヤブロック=5.0

### minecraft:destructible_by_explosion
- **用途**: 爆発耐性
- **パラメータ**: `{ "explosion_resistance": number }`
- **バニラ参考値**: 土=0.5, 石=6.0, 黒曜石=1200, ネザライト=1200

### minecraft:friction
- **用途**: 表面摩擦（プレイヤーの滑りやすさ）
- **パラメータ**: `{ "value": number }`
- **範囲**: 0.0（最も滑る）〜1.0（最も滑らない）
- **デフォルト**: 0.6
- **バニラ参考値**: 氷=0.98, 通常ブロック=0.6

### minecraft:light_emission
- **用途**: ブロックの発光量
- **パラメータ**: `{ "emission": number }`
- **範囲**: 0〜15
- **バニラ参考値**: グロウストーン=15, 松明=14, レッドストーントーチ=7

### minecraft:light_dampening
- **用途**: 光の遮断量
- **パラメータ**: `{ "value": number }`
- **範囲**: 0〜15
- **デフォルト**: 15（完全に遮断）
- **0の場合**: ガラスのように光を通す

### minecraft:map_color
- **用途**: 地図上の表示色
- **パラメータ**: `"#RRGGBB"` 形式の文字列
- **例**: `"minecraft:map_color": "#FF0000"`

### minecraft:geometry
- **用途**: カスタム3D形状
- **パラメータ**: `{ "identifier": "geometry.namespace.name", "bone_visibility": {} }`
- **制約**: 最大 30x30x30 ピクセル（1ブロック = 16ピクセル）

### minecraft:material_instances
- **用途**: 面ごとのテクスチャとレンダリング設定
```json
"minecraft:material_instances": {
    "*": { "texture": "my_texture", "render_method": "opaque" },
    "up": { "texture": "my_top", "render_method": "opaque" },
    "down": { "texture": "my_bottom", "render_method": "opaque" }
}
```
- **render_method**: `"opaque"`, `"alpha_test"` (葉のような穴あき), `"blend"` (半透明), `"double_sided"`
- **面指定**: `"*"` (全面), `"up"`, `"down"`, `"north"`, `"south"`, `"east"`, `"west"`

### minecraft:collision_box
- **用途**: 物理的な当たり判定
- **パラメータ**: `{ "origin": [-8, 0, -8], "size": [16, 16, 16] }` または `false`（当たり判定なし）

### minecraft:selection_box
- **用途**: カーソル選択範囲
- **パラメータ**: `{ "origin": [-8, 0, -8], "size": [16, 16, 16] }` または `false`

### minecraft:loot
- **用途**: 破壊時のドロップ
- **パラメータ**: `"loot_tables/blocks/my_block.json"`

### minecraft:crafting_table
- **用途**: 作業台として機能させる
- **パラメータ**: `{ "table_name": "My Table", "crafting_tags": ["crafting_table"] }`

### minecraft:flammable
- **用途**: 炎で燃えるか
- **パラメータ**: `{ "catch_chance_modifier": 5, "destroy_chance_modifier": 20 }`

### minecraft:placement_filter
- **用途**: 設置条件
- **パラメータ**: `{ "conditions": [{ "allowed_faces": ["up"], "block_filter": ["minecraft:grass"] }] }`

## ブロック states と permutations

カスタムブロック状態を使うことで、1つのブロック定義で複数の見た目・挙動を持たせることができます。

```json
"states": {
    "namespace:my_state": [0, 1, 2, 3]
},
"permutations": [
    {
        "condition": "q.block_state('namespace:my_state') == 1",
        "components": {
            "minecraft:material_instances": { "*": { "texture": "alt_texture" } }
        }
    }
]
```
