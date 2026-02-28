---
id: blocks
title: ブロックコンポーネント 完全リファレンス（公式準拠）
category: component
tags: [block, component, カスタムブロック, ブロック, geometry, material, collision, light, flammable, crafting_table, redstone, loot]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-03-01"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/blockcomponentslist"
source_verified_at: "2026-03-01"
freshness_days: 180
---

# ブロックコンポーネント 完全リファレンス（公式準拠）

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn（最終更新: 2026-01-08）| 確認: 2026-03-01

## 基本構造

```json
{
    "format_version": "1.21.40",
    "minecraft:block": {
        "description": {
            "identifier": "namespace:block_name",
            "menu_category": {
                "category": "construction"
            }
        },
        "components": {}
    }
}
```

## 全コンポーネント一覧（公式: 2026-01-08時点）

### 光・視覚

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:light_emission` | 光を放出（0〜15） | `15`（グロウストーン相当） |
| `minecraft:block_light_emission` | 光の放出量 | light_emissionの別名表現 |
| `minecraft:light_dampening` | 光の遮断量（0〜15） | `15`（完全遮断） |
| `minecraft:block_light_absorption` | 光の吸収量 | light_dampeningの別名表現 |
| `minecraft:map_color` | 地図上の色 | `"#FF0000"` or `[255, 0, 0]` |
| `minecraft:destruction_particles` | 破壊パーティクル | テクスチャ/色の指定 |

### 形状・当たり判定

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:geometry` | カスタムモデル | `{ "identifier": "geometry.my_block" }` |
| `minecraft:collision_box` | 当たり判定 | `{ "origin": [-8, 0, -8], "size": [16, 16, 16] }` or `false` |
| `minecraft:selection_box` | 選択判定 | `{ "origin": [-8, 0, -8], "size": [16, 16, 16] }` or `false` |
| `minecraft:transformation` | 回転・スケール変換 | `{ "rotation": [0, 90, 0] }` |
| `minecraft:random_offset` | ランダム配置オフセット | `{ "max_horizontal_offset": 0.25 }` |

### マテリアル・テクスチャ

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:material_instances` | テクスチャとレンダー設定 | 下記参照 |
| `minecraft:embedded_visual` | 内蔵ビジュアル | ブロック内に表示するモデル |
| `minecraft:item_visual` | アイテム時のビジュアル | インベントリ表示 |

#### material_instances の詳細

```json
"minecraft:material_instances": {
    "*": {
        "texture": "my_block_texture",
        "render_method": "opaque",
        "face_dimming": true,
        "ambient_occlusion": true
    },
    "up": {
        "texture": "my_block_top"
    }
}
```

**render_method**:
| 値 | 用途 |
|----|------|
| `"opaque"` | 不透過（デフォルト、最高パフォーマンス） |
| `"alpha_test"` | 完全透過/不透過（葉っぱ型。アルファ値0.5以下=透過） |
| `"blend"` | 半透過（ガラス型。グラデーション透過可能、描画負荷高） |
| `"double_sided"` | 両面描画 |

**面指定キー**: `"*"`(全面), `"up"`, `"down"`, `"north"`, `"south"`, `"east"`, `"west"`

### 破壊・耐性

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:destructible_by_mining` | 採掘破壊 | `{ "seconds_to_destroy": 3.0 }` |
| `minecraft:destructible_by_explosion` | 爆発耐性 | `{ "explosion_resistance": 6.0 }` |
| `minecraft:destroy_time` | 破壊時間（旧式） | `3.0` |
| `minecraft:explosion_resistance` | 爆発耐性（旧式） | `6.0` |
| `minecraft:friction` | 摩擦（0.0〜1.0） | `0.6`（デフォルト）、`0.98`（氷） |
| `minecraft:flammable` | 可燃性 | `{ "catch_chance_modifier": 5, "destroy_chance_modifier": 20 }` |

### 配置・接続

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:placement_filter` | 配置条件 | `{ "conditions": [{ "allowed_faces": ["up"], "block_filter": ["minecraft:grass_block"] }] }` |
| `minecraft:connection_rule` | 接続ルール | フェンス・壁のように隣接ブロックに接続 |
| `minecraft:support` | 支持構造 | ブロックの支持条件 |
| `minecraft:replaceable` | 置換可能 | 草のように上書き設置可能 |
| `minecraft:chest_obstruction` | チェスト妨害判定 | チェスト開放を妨げ |

### レッドストーン

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:redstone_conductivity` | RS伝導性 | レッドストーン信号の伝導設定 |
| `minecraft:redstone_consumer` | RS受信 | レッドストーン信号を受信 |
| `minecraft:redstone_producer` | RS発信 | レッドストーン信号を発信 |

> 注意: 以前はカスタムブロックのレッドストーン対応は不可能とされていましたが、
> 最新版では上記の3コンポーネントが追加されています。

### 機能・対話

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:crafting_table` | カスタム作業台 | `{ "crafting_tags": ["crafting_table"], "table_name": "My Workbench" }` |
| `minecraft:loot` | ルートテーブル | `"loot_tables/blocks/my_block.json"` |
| `minecraft:tick` | Tick処理 | `{ "interval_range": [10, 10] }` |
| `minecraft:entity_fall_on` | 落下時イベント | エンティティがブロック上に落下した時 |

### 環境

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:liquid_detection` | 液体検知 | 水との相互作用 |
| `minecraft:precipitation_interactions` | 降水反応 | 雨/雪との相互作用 |
| `minecraft:movable` | ピストン移動 | ピストンで動かせるか |
| `minecraft:flower_pottable` | 植木鉢設置可能 | 植木鉢に設置可能なブロック |

### 表示名

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:display_name` | 表示名 | `"My Custom Block"` |

### 非推奨/内部コンポーネント（使用不可）

| コンポーネント | 状態 |
|--------------|------|
| `bone_visibility` | 非推奨 |
| `breathability` | 内部 |
| `custom_components` | Script API用 |
| `queued_ticking` | 非推奨（`tick`に移行） |
| `random_ticking` | 非推奨（`tick`に移行） |
| `unit_cube` | 非推奨 |

## States と Permutations

### States（状態定義）

```json
"description": {
    "identifier": "namespace:my_block",
    "states": {
        "namespace:facing": [0, 1, 2, 3],
        "namespace:powered": [false, true]
    }
}
```

### Permutations（状態ごとのコンポーネント変更）

```json
"permutations": [
    {
        "condition": "q.block_state('namespace:facing') == 1",
        "components": {
            "minecraft:transformation": { "rotation": [0, 90, 0] }
        }
    }
]
```
