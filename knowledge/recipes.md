---
id: recipes
title: レシピ仕様リファレンス
category: structure
tags: [recipe, shaped, shapeless, furnace, crafting, crafting_table, クラフト, レシピ, 作業台, かまど]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/"
source_verified_at: "2026-02-28"
freshness_days: 365
---

# レシピ仕様リファレンス

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## Shapedレシピ（型ありクラフト）

```json
{
    "format_version": "1.21.0",
    "minecraft:recipe_shaped": {
        "description": { "identifier": "namespace:my_recipe" },
        "tags": ["crafting_table"],
        "pattern": [
            " A ",
            " A ",
            " B "
        ],
        "key": {
            "A": { "item": "namespace:ruby" },
            "B": { "item": "minecraft:stick" }
        },
        "result": { "item": "namespace:ruby_sword", "count": 1 }
    }
}
```

- **pattern**: 3行×3列。スペースは空きスロット
- **key**: pattern内の文字とアイテムの対応
- **tags**: `["crafting_table"]` が標準

## Shapelessレシピ（型なしクラフト）

```json
{
    "format_version": "1.21.0",
    "minecraft:recipe_shapeless": {
        "description": { "identifier": "namespace:my_dye_mix" },
        "tags": ["crafting_table"],
        "ingredients": [
            { "item": "minecraft:red_dye" },
            { "item": "minecraft:blue_dye" }
        ],
        "result": { "item": "minecraft:purple_dye", "count": 2 }
    }
}
```

## Furnaceレシピ（かまど精錬）

```json
{
    "format_version": "1.21.0",
    "minecraft:recipe_furnace": {
        "description": { "identifier": "namespace:smelt_ruby_ore" },
        "tags": ["furnace"],
        "input": "namespace:ruby_ore",
        "output": "namespace:ruby"
    }
}
```

- **tags**: `["furnace"]`, `["blast_furnace"]`, `["smoker"]`, `["campfire"]`, `["soul_campfire"]`

## tags 一覧

| tag | 用途 |
|-----|------|
| `"crafting_table"` | 作業台 |
| `"stonecutter"` | 石切台 |
| `"furnace"` | かまど |
| `"blast_furnace"` | 溶鉱炉 |
| `"smoker"` | 燻製器 |
| `"campfire"` | 焚き火 |
| `"soul_campfire"` | 魂の焚き火 |
| `"cartography_table"` | 製図台 |
| `"brewing_stand"` | 醸造台（ポーション） |

## ファイル配置

レシピJSONは `BP/recipes/` ディレクトリ内に配置。ファイル名は自由。
