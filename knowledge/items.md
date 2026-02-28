---
id: items
title: アイテムコンポーネント 完全リファレンス（公式準拠）
category: component
tags: [item, component, カスタムアイテム, 武器, 道具, 食料, アイテム, damage, durability, food, icon, wearable, shooter, throwable, projectile]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-03-01"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponentlist"
source_verified_at: "2026-03-01"
freshness_days: 180
---

# アイテムコンポーネント 完全リファレンス（公式準拠）

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn（最終更新: 2026-01-08）| 確認: 2026-03-01

## 基本構造

```json
{
    "format_version": "1.21.40",
    "minecraft:item": {
        "description": {
            "identifier": "namespace:item_name",
            "menu_category": {
                "category": "equipment",
                "group": "itemGroup.name.sword"
            }
        },
        "components": {
            "minecraft:icon": { "textures": { "default": "my_item_icon" } },
            "minecraft:display_name": { "value": "My Item" }
        }
    }
}
```

## 全コンポーネント一覧（公式: 2026-01-08時点）

### 基本・表示

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:icon` | アイコンテクスチャ | `{ "textures": { "default": "texture_key" } }` |
| `minecraft:display_name` | 表示名 | `{ "value": "My Item" }` |
| `minecraft:hover_text_color` | ホバーテキスト色 | `"gold"` |
| `minecraft:rarity` | レア度表示色 | `"common"`, `"uncommon"`, `"rare"`, `"epic"` |
| `minecraft:glint` | エンチャント光沢 | `true` / `false` |
| `minecraft:max_stack_size` | 最大スタック数 | `64`（最大64） |
| `minecraft:tags` | タグ付け | `{ "tags": ["minecraft:is_sword"] }` |

### 戦闘・攻撃

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:damage` | 攻撃力 | `{ "value": 7 }` |
| `minecraft:hand_equipped` | 手持ち表示（斜め持ち） | `true` |
| `minecraft:cooldown` | 使用クールダウン | `{ "category": "attack", "duration": 1.0 }` |
| `minecraft:enchantable` | エンチャント可能 | `{ "value": 14, "slot": "sword" }` |
| `minecraft:kinetic_weapon` | 運動エネルギー武器 | 移動速度によるダメージ変動 |
| `minecraft:piercing_weapon` | 貫通武器 | 複数エンティティを貫通 |
| `minecraft:swing_duration` | 振り時間 | `{ "duration": 0.5 }` |
| `minecraft:swing_sounds` | 振り音 | 使用時のサウンド |

### 耐久・修理

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:durability` | 耐久値 | `{ "max_durability": 250, "damage_chance": { "min": 60, "max": 100 } }` |
| `minecraft:durability_sensor` | 耐久値センサー | 閾値でイベント発火 |
| `minecraft:repairable` | 修理可能 | `{ "repair_items": [{ "items": ["minecraft:iron_ingot"], "repair_amount": 25 }] }` |
| `minecraft:damage_absorption` | ダメージ吸収 | 装備時のダメージ軽減 |

### 食べ物・消費

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:food` | 食料 | `{ "nutrition": 4, "saturation_modifier": 0.6, "can_always_eat": false }` |
| `minecraft:use_animation` | 使用アニメーション | `"eat"`, `"drink"`, `"bow"`, `"crossbow"`, `"spear"` |
| `minecraft:use_modifiers` | 使用時間修正 | `{ "use_duration": 1.6, "movement_modifier": 0.35 }` |

### 射撃・投擲

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:shooter` | 射撃（弓型） | `{ "max_draw_duration": 1.0, "charge_on_draw": true, "scale_power_by_draw_duration": true }` |
| `minecraft:throwable` | 投擲可能 | `{ "do_swing_animation": true, "max_draw_duration": 0.0, "scale_power_by_draw_duration": false }` |
| `minecraft:projectile` | 飛翔体定義 | `{ "projectile_entity": "namespace:my_arrow", "minimum_critical_power": 1.0 }` |

### 配置・設置

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:block_placer` | ブロック設置 | `{ "block": "namespace:my_block" }` |
| `minecraft:entity_placer` | エンティティ設置 | `{ "entity": "namespace:my_entity", "dispense_on": ["minecraft:grass_block"] }` |
| `minecraft:seed` | 種（農作物設置） | `{ "crop_result": "namespace:my_crop" }` |

### 装備・装着

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:wearable` | 装備可能 | `{ "slot": "slot.armor.head" }` |
| `minecraft:allow_off_hand` | オフハンド許可 | `true` |
| `minecraft:dyeable` | 染色可能 | `{ "default_color": "#FF0000" }` |

### 収納・バンドル

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:bundle_interaction` | バンドル操作 | バンドルUIの有効化 |
| `minecraft:storage_item` | 収納アイテム | アイテムをストレージとして使用 |
| `minecraft:storage_weight_limit` | 収納重量上限 | 最大収納可能重量 |
| `minecraft:storage_weight_modifier` | 収納重量補正 | アイテムの重量乗数 |

### その他

| コンポーネント | 用途 | パラメータ例 |
|--------------|------|------------|
| `minecraft:fuel` | 燃料 | `{ "duration": 200 }` (tick単位) |
| `minecraft:record` | レコード | 音楽レコード |
| `minecraft:fire_resistant` | 耐火 | `true` (溶岩で消滅しない) |
| `minecraft:liquid_clipped` | 液体クリッピング | 水中での表示制御 |
| `minecraft:can_destroy_in_creative` | クリエイティブで破壊可 | `true` |
| `minecraft:should_despawn` | デスポーン | `true` |
| `minecraft:stacked_by_data` | データ値別スタック | `true` |
| `minecraft:interact_button` | モバイルインタラクトボタン | `true` or `"テキスト"` |
| `minecraft:compostable` | コンポスト可能 | `{ "chance": 0.65 }` |

### 非推奨/内部コンポーネント（使用不可）

| コンポーネント | 状態 |
|--------------|------|
| `chargeable` | 非推奨 |
| `custom_components` | 内部/Script API用 |
| `render_offsets` | 非推奨 |
| `use_duration` | 非推奨（`use_modifiers`に移行） |
| `weapon` | 非推奨（`damage`に移行） |

## スロット名一覧（wearable用）

| スロット | 部位 |
|---------|------|
| `slot.armor.head` | 頭 |
| `slot.armor.chest` | 胸 |
| `slot.armor.legs` | 脚 |
| `slot.armor.feet` | 足 |
| `slot.weapon.offhand` | オフハンド |
