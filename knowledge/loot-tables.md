---
id: loot-tables
title: ルートテーブル仕様リファレンス
category: structure
tags: [loot, loot_table, drop, ドロップ, ルートテーブル, アイテムドロップ]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/lootreference/"
source_verified_at: "2026-02-28"
freshness_days: 365
---

# ルートテーブル仕様リファレンス

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## 基本構造

```json
{
    "pools": [
        {
            "rolls": 1,
            "entries": [
                {
                    "type": "item",
                    "name": "namespace:my_item",
                    "weight": 1,
                    "functions": []
                }
            ],
            "conditions": []
        }
    ]
}
```

## rolls（ロール回数）

- **固定値**: `"rolls": 1`
- **範囲**: `"rolls": { "min": 1, "max": 3 }`

## entries[].type

| type | 用途 |
|------|------|
| `"item"` | アイテムドロップ |
| `"loot_table"` | 他のルートテーブルを参照 |
| `"empty"` | 何もドロップしない |

## functions（ドロップ加工）

### set_count（個数設定）
```json
{ "function": "set_count", "count": { "min": 1, "max": 3 } }
```

### set_data（データ値）
```json
{ "function": "set_data", "data": 0 }
```

### enchant_randomly（ランダムエンチャント）
```json
{ "function": "enchant_randomly" }
```

### enchant_with_levels（レベル指定エンチャント）
```json
{ "function": "enchant_with_levels", "levels": { "min": 5, "max": 15 }, "treasure": false }
```

### looting_enchant（ドロップ増加エンチャント対応）
```json
{ "function": "looting_enchant", "count": { "min": 0, "max": 1 } }
```

### set_damage（耐久値設定）
```json
{ "function": "set_damage", "damage": { "min": 0.0, "max": 1.0 } }
```

## conditions（ドロップ条件）

### killed_by_player
```json
{ "condition": "killed_by_player" }
```

### random_chance
```json
{ "condition": "random_chance", "chance": 0.1 }
```

### random_chance_with_looting
```json
{ "condition": "random_chance_with_looting", "chance": 0.025, "looting_multiplier": 0.01 }
```

## ファイル配置

- エンティティ用: `BP/loot_tables/entities/xxx.json`
- ブロック用: `BP/loot_tables/blocks/xxx.json`
- チェスト用: `BP/loot_tables/chests/xxx.json`
