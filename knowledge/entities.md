---
id: entities
title: エンティティコンポーネント リファレンス
category: component
tags: [entity, mob, component, behavior, navigation, health, attack, movement, tameable, rideable, loot, spawn, AI, エンティティ, モブ, 体力, 攻撃, 移動, テイム]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# エンティティコンポーネント リファレンス

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## BP エンティティ基本構造

```json
{
    "format_version": "1.21.0",
    "minecraft:entity": {
        "description": {
            "identifier": "namespace:my_entity",
            "is_spawnable": true,
            "is_summonable": true,
            "is_experimental": false
        },
        "component_groups": {},
        "components": {},
        "events": {}
    }
}
```

## RP クライアントエンティティ基本構造

```json
{
    "format_version": "1.10.0",
    "minecraft:client_entity": {
        "description": {
            "identifier": "namespace:my_entity",
            "textures": { "default": "textures/entity/my_entity" },
            "geometry": { "default": "geometry.my_entity" },
            "render_controllers": ["controller.render.default"],
            "spawn_egg": { "base_color": "#FF0000", "overlay_color": "#00FF00" }
        }
    }
}
```

## 主要コンポーネント（属性系）

### minecraft:health
`{ "value": 10, "max": 10 }` — バニラ: ゾンビ=20, クリーパー=20, ウィザー=300

### minecraft:attack
`{ "damage": 3 }` — バニラ: ゾンビ=3, スケルトン=2(弓)

### minecraft:movement
`{ "value": 0.25 }` — バニラ: ゾンビ=0.23, クリーパー=0.25

### minecraft:scale
`{ "value": 1.0 }` — 1.0が通常サイズ

### minecraft:collision_box
`{ "width": 0.6, "height": 1.8 }` — プレイヤーサイズ基準

### minecraft:physics
`{ "has_collision": true, "has_gravity": true }`

### minecraft:pushable
`{ "is_pushable": true, "is_pushable_by_piston": true }`

### minecraft:type_family
`{ "family": ["monster", "zombie", "undead"] }` — AI行動のフィルタに使用

### minecraft:fire_immune
`{}` — 炎ダメージ無効

### minecraft:knockback_resistance
`{ "value": 0.5 }` — 0.0〜1.0

## 主要コンポーネント（移動系）

### minecraft:movement.basic
地上の基本移動。ほぼ全ての地上モブに必須。

### minecraft:movement.fly
飛行移動。

### minecraft:movement.swim
水中移動。

### minecraft:navigation.walk
`{ "can_path_over_water": true, "avoid_water": true }` — 地上パスファインディング

### minecraft:navigation.fly
`{ "can_path_over_water": true }` — 飛行パスファインディング

### minecraft:navigation.swim
水中パスファインディング

## 主要コンポーネント（AI行動系）

### minecraft:behavior.melee_attack
`{ "priority": 3, "speed_multiplier": 1.2 }` — 近接攻撃

### minecraft:behavior.ranged_attack
`{ "priority": 3, "attack_interval_min": 1.0, "attack_radius": 15.0 }` — 遠距離攻撃

### minecraft:behavior.random_stroll
`{ "priority": 6, "speed_multiplier": 1.0 }` — ランダム歩行

### minecraft:behavior.look_at_player
`{ "priority": 7, "look_distance": 8.0 }` — プレイヤーを見る

### minecraft:behavior.hurt_by_target
`{ "priority": 1 }` — 攻撃者をターゲット

### minecraft:behavior.nearest_attackable_target
`{ "priority": 2, "entity_types": [{"filters": {"test": "is_family", "value": "player"}}] }`

### minecraft:behavior.follow_owner
`{ "priority": 4, "speed_multiplier": 1.0, "start_distance": 10, "stop_distance": 2 }` — ペット追従

### minecraft:behavior.tempt
`{ "priority": 4, "speed_multiplier": 1.2, "items": ["minecraft:carrot"] }` — おびき寄せ

### minecraft:behavior.breed
`{ "priority": 3, "speed_multiplier": 1.0 }` — 繁殖行動

## 主要コンポーネント（特性系）

### minecraft:tameable
`{ "probability": 0.33, "tame_items": ["minecraft:bone"], "tame_event": {"event": "on_tame"} }`

### minecraft:rideable
`{ "seat_count": 1, "seats": [{"position": [0, 1, 0]}], "family_types": ["player"] }`

### minecraft:loot
`{ "table": "loot_tables/entities/my_entity.json" }` — ドロップテーブル

### minecraft:spawn_entity
子エンティティを定期的にスポーンさせる

### minecraft:interact
プレイヤーの右クリック操作に反応

## component_groups と events

コンポーネントグループで状態を切り替え（例: 赤ちゃん→大人、テイム前→テイム後）

```json
"component_groups": {
    "baby": { "minecraft:scale": { "value": 0.5 }, "minecraft:is_baby": {} },
    "adult": { "minecraft:scale": { "value": 1.0 } }
},
"events": {
    "minecraft:entity_born": { "add": { "component_groups": ["baby"] } },
    "grow_up": { "remove": { "component_groups": ["baby"] }, "add": { "component_groups": ["adult"] } }
}
```
