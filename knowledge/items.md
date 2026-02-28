---
id: items
title: アイテムコンポーネント全リファレンス
category: component
tags: [item, weapon, armor, food, tool, component, damage, durability, enchantable, wearable, cooldown, icon, display_name, max_stack_size, hand_equipped, throwable, projectile, shooter, アイテム, 武器, 防具, 食料, 道具]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# アイテムコンポーネント全リファレンス

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## 基本構造

```json
{
    "format_version": "1.21.0",
    "minecraft:item": {
        "description": {
            "identifier": "namespace:item_name",
            "menu_category": {
                "category": "equipment",
                "group": "itemGroup.name.sword",
                "is_hidden_in_commands": false
            }
        },
        "components": {
            "minecraft:icon": { "texture": "item_texture_name" },
            "minecraft:display_name": { "value": "item.namespace:item_name.name" }
        }
    }
}
```

## menu_category.category 有効値

| category | 用途 |
|----------|------|
| `"construction"` | 建築ブロック |
| `"equipment"` | 装備品（武器、防具、道具） |
| `"items"` | その他アイテム | 
| `"nature"` | 自然アイテム（食料含む） |
| `"none"` | クリエイティブメニュー非表示 |

## コンポーネント一覧

### minecraft:icon
- **用途**: アイテムアイコンのテクスチャ指定
- **必須**: はい
- **パラメータ**: `{ "texture": "string" }`
- **注意**: `textures/item_texture.json`のtexture_dataで定義した名前を指定

### minecraft:display_name
- **用途**: 表示名
- **パラメータ**: `{ "value": "string" }`
- **注意**: langファイルのキーを参照（例: `"item.myaddon:ruby_sword.name"`）

### minecraft:max_stack_size
- **用途**: 最大スタック数
- **パラメータ**: `{ "value": number }`
- **有効値**: 1〜64
- **デフォルト**: 64
- **注意**: 武器・防具は通常1に設定

### minecraft:damage
- **用途**: 近接攻撃ダメージ
- **since**: 1.21.0
- **deprecated**: false
- **パラメータ**: `{ "value": number }`
- **有効値**: 0以上の整数
- **例**: `"minecraft:damage": { "value": 7 }`
- **バニラ参考値**: 木の剣=4, 石の剣=5, 鉄の剣=6, ダイヤ剣=7, ネザライト剣=8

### minecraft:durability
- **用途**: 耐久値
- **パラメータ**: `{ "max_durability": number, "damage_chance": { "min": number, "max": number } }`
- **例**: `"minecraft:durability": { "max_durability": 250 }`
- **バニラ参考値**: 木=59, 石=131, 鉄=250, ダイヤ=1561, ネザライト=2031

### minecraft:hand_equipped
- **用途**: 手持ち時の3D表示
- **パラメータ**: `{ "value": boolean }`
- **推奨**: 武器・道具は `true`

### minecraft:enchantable
- **用途**: エンチャント可能にする
- **パラメータ**: `{ "value": number, "slot": "string" }`
- **slot有効値**: `"sword"`, `"armor_head"`, `"armor_torso"`, `"armor_legs"`, `"armor_feet"`, `"bow"`, `"fishing_rod"`, `"flintsteel"`, `"hoe"`, `"shears"`, `"axe"`, `"pickaxe"`, `"shovel"`
- **value**: エンチャント適性値（高いほど良いエンチャントが付きやすい）

### minecraft:food
- **用途**: 食料として使用可能にする
- **パラメータ**:
```json
{
    "nutrition": 4,
    "saturation_modifier": 0.6,
    "can_always_eat": false,
    "using_converts_to": "minecraft:bowl"
}
```
- **nutrition**: 回復する空腹度ポイント
- **saturation_modifier**: 隠し満腹度（`"poor"`=0.2, `"low"`=0.6, `"normal"`=1.2, `"good"`=1.6, `"max"`=2.4 または直接数値）

### minecraft:wearable
- **用途**: 装備可能にする
- **パラメータ**: `{ "slot": "string", "protection": number }`
- **slot有効値**: `"slot.armor.head"`, `"slot.armor.chest"`, `"slot.armor.legs"`, `"slot.armor.feet"`
- **protection**: 防御ポイント
- **バニラ参考値**: ダイヤヘルメット=3, チェスト=8, レギンス=6, ブーツ=3

### minecraft:cooldown
- **用途**: 使用後のクールダウン時間
- **パラメータ**: `{ "category": "string", "duration": number }`
- **duration**: 秒数
- **category**: 同じcategoryのアイテム同士でクールダウンを共有

### minecraft:throwable
- **用途**: 投げられるアイテムにする
- **パラメータ**: `{ "do_swing_animation": boolean, "launch_power_scale": number, "max_draw_duration": number, "max_launch_power": number, "min_draw_duration": number, "scale_power_by_draw_duration": boolean }`

### minecraft:shooter
- **用途**: 射撃（弓のような）
- **パラメータ**: `{ "ammunition": [{"item": "string", "use_offhand": boolean}], "charge_on_draw": boolean, "max_draw_duration": number }`

### minecraft:repairable
- **用途**: 修理可能にする
- **パラメータ**: `{ "repair_items": [{"items": ["string"], "repair_amount": number}] }`

### minecraft:use_modifiers
- **用途**: 使用時の速度修飾
- **パラメータ**: `{ "use_duration": number, "movement_modifier": number }`
