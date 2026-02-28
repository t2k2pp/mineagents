---
id: vanilla-identifiers
title: バニラアイテム・ブロック・エンティティ識別子一覧
category: reference
tags: [vanilla, identifier, item, block, entity, minecraft, バニラ, 識別子, 素材]
mc_version_min: "1.21.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitylist"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# バニラ識別子一覧

> MC Bedrock 1.21.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## よく使うバニラ素材アイテム

| 識別子 | 名称 |
|--------|------|
| `minecraft:diamond` | ダイヤモンド |
| `minecraft:iron_ingot` | 鉄インゴット |
| `minecraft:gold_ingot` | 金インゴット |
| `minecraft:copper_ingot` | 銅インゴット |
| `minecraft:netherite_ingot` | ネザライトインゴット |
| `minecraft:emerald` | エメラルド |
| `minecraft:lapis_lazuli` | ラピスラズリ |
| `minecraft:quartz` | ネザークォーツ |
| `minecraft:amethyst_shard` | アメジストの欠片 |
| `minecraft:coal` | 石炭 |
| `minecraft:redstone` | レッドストーン |
| `minecraft:glowstone_dust` | グロウストーンダスト |
| `minecraft:stick` | 棒 |
| `minecraft:string` | 糸 |
| `minecraft:leather` | 革 |
| `minecraft:bone` | 骨 |
| `minecraft:feather` | 羽 |
| `minecraft:gunpowder` | 火薬 |
| `minecraft:blaze_rod` | ブレイズロッド |
| `minecraft:ender_pearl` | エンダーパール |
| `minecraft:phantom_membrane` | ファントムの皮膜 |

## よく使うバニラ道具・武器

| 識別子 | 名称 |
|--------|------|
| `minecraft:wooden_sword` | 木の剣 |
| `minecraft:stone_sword` | 石の剣 |
| `minecraft:iron_sword` | 鉄の剣 |
| `minecraft:diamond_sword` | ダイヤの剣 |
| `minecraft:netherite_sword` | ネザライトの剣 |
| `minecraft:bow` | 弓 |
| `minecraft:crossbow` | クロスボウ |
| `minecraft:shield` | 盾 |
| `minecraft:trident` | トライデント |

## よく使うバニラブロック

| 識別子 | 名称 |
|--------|------|
| `minecraft:stone` | 石 |
| `minecraft:cobblestone` | 丸石 |
| `minecraft:dirt` | 土 |
| `minecraft:grass_block` | 草ブロック |
| `minecraft:oak_planks` | オークの板材 |
| `minecraft:iron_block` | 鉄ブロック |
| `minecraft:gold_block` | 金ブロック |
| `minecraft:diamond_block` | ダイヤブロック |
| `minecraft:netherite_block` | ネザライトブロック |
| `minecraft:obsidian` | 黒曜石 |
| `minecraft:glass` | ガラス |
| `minecraft:glowstone` | グロウストーン |
| `minecraft:crafting_table` | 作業台 |
| `minecraft:furnace` | かまど |
| `minecraft:chest` | チェスト |
| `minecraft:anvil` | 金床 |

## よく使うバニラエンティティ

| 識別子 | 名称 | ファミリー |
|--------|------|-----------|
| `minecraft:zombie` | ゾンビ | monster, zombie, undead |
| `minecraft:skeleton` | スケルトン | monster, skeleton, undead |
| `minecraft:creeper` | クリーパー | monster |
| `minecraft:spider` | クモ | monster, arthropod |
| `minecraft:cow` | 牛 | animal, mob |
| `minecraft:pig` | 豚 | animal, mob |
| `minecraft:sheep` | 羊 | animal, mob |
| `minecraft:chicken` | ニワトリ | animal, mob |
| `minecraft:wolf` | オオカミ | animal, mob |
| `minecraft:cat` | 猫 | animal, mob |
| `minecraft:horse` | 馬 | animal, mob |
| `minecraft:villager_v2` | 村人 | villager, mob |
| `minecraft:iron_golem` | アイアンゴーレム | mob |
| `minecraft:bee` | ミツバチ | animal, arthropod |
| `minecraft:warden` | ウォーデン | monster |

## カスタム識別子のルール

- 形式: `namespace:name`
- namespace: 小文字英数字とアンダースコア（`minecraft`は使用不可）
- name: 小文字英数字とアンダースコア
- 例: `myaddon:ruby_sword`, `custom_mod:fire_block`
