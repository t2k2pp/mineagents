---
id: textures
title: テクスチャ仕様リファレンス
category: reference
tags: [texture, テクスチャ, item_texture, terrain_texture, image, png, pixel, リソースパック, RP]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/texturereference/"
source_verified_at: "2026-02-28"
freshness_days: 365
---

# テクスチャ仕様リファレンス

> MC Bedrock 1.16.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## テクスチャサイズ

| 種類 | 標準サイズ | 高解像度 | 形式 |
|------|----------|---------|------|
| アイテム | 16×16 px | 32×32, 64×64 | PNG |
| ブロック | 16×16 px | 32×32, 64×64 | PNG |
| エンティティ | モデル依存 | 64×64〜128×128 | PNG |
| パーティクル | 8×8〜16×16 | — | PNG |
| UI | 任意 | — | PNG |

**制約**: テクスチャサイズは2の累乗（16, 32, 64, 128, 256, 512）が推奨。

## アイテムテクスチャマッピング（item_texture.json）

配置: `RP/textures/item_texture.json`

```json
{
    "resource_pack_name": "My Addon",
    "texture_name": "atlas.items",
    "texture_data": {
        "ruby": {
            "textures": "textures/items/ruby"
        },
        "ruby_sword": {
            "textures": "textures/items/ruby_sword"
        }
    }
}
```

- **texture_data のキー**: アイテム定義の `minecraft:icon` の `texture` と一致させる
- **textures の値**: 拡張子なしのパス（.pngは自動補完）

## ブロックテクスチャマッピング（terrain_texture.json）

配置: `RP/textures/terrain_texture.json`

```json
{
    "resource_pack_name": "My Addon",
    "texture_name": "atlas.terrain",
    "texture_data": {
        "ruby_block": {
            "textures": "textures/blocks/ruby_block"
        },
        "ruby_ore": {
            "textures": "textures/blocks/ruby_ore"
        }
    }
}
```

- **texture_data のキー**: ブロック定義の `material_instances` の `texture` と一致させる

## エンティティテクスチャ

配置: `RP/textures/entity/xxx.png`

RPクライアントエンティティ定義で参照:
```json
"textures": {
    "default": "textures/entity/my_entity",
    "angry": "textures/entity/my_entity_angry"
}
```

## テクスチャファイル配置ルール

```
RP/
  textures/
    items/          ← アイテムアイコン (16x16)
    blocks/         ← ブロックテクスチャ (16x16)
    entity/         ← エンティティスキン
    particle/       ← パーティクル
    ui/             ← UIテクスチャ
    item_texture.json
    terrain_texture.json
```

## Stable Diffusion 生成テクスチャの注意点

- 生成後は **16×16にリサイズ** する（アイテム・ブロック用）
- **背景透過** (アルファチャンネル) が必要な場合は別途処理
- **ピクセルアート風** のプロンプトを使うとMCらしい仕上がりになる
- カラーパレットを制限するとバニラとの統一感が出る
