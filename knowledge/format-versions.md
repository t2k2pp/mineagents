---
id: format-versions
title: format_version 互換性リファレンス
category: structure
tags: [format_version, version, compatibility, manifest, item, block, entity]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# format_version 互換性リファレンス

> このドキュメントは MC Bedrock 1.16.0〜1.21.60 を対象としています。
> 情報源: Microsoft Learn 公式ドキュメント
> 最終確認: 2026-02-28

## format_version とは

`format_version` はMinecraftがJSONファイルの構造をどのバージョンの仕様で解釈するかを指定するフィールドです。
**正しい format_version を指定しないとアドオンが動作しません。**

## 推奨 format_version（2026年2月時点）

| ファイル種別 | 推奨 format_version | 備考 |
|------------|-------------------|------|
| manifest.json | `2` (数値) | 常に `2` を使用 |
| アイテム定義 | `"1.21.0"` | 1.21.0 で minecraft:damage 等が追加 |
| ブロック定義 | `"1.21.0"` | 1.21.0 で安定 |
| エンティティ (BP) | `"1.21.0"` | サーバーサイドエンティティ |
| エンティティ (RP) | `"1.10.0"` | クライアントエンティティ |
| レシピ | `"1.21.0"` | shaped/shapeless/furnace |
| ルートテーブル | `"1.21.0"` | ドロップ定義 |
| スポーンルール | `"1.8.0"` | 古い format_version でも動作 |
| アニメーション | `"1.10.0"` | RPアニメーション |
| アニメーションコントローラ | `"1.10.0"` | RPアニメコントローラ |
| レンダーコントローラ | `"1.10.0"` | RPレンダーコントローラ |
| ジオメトリ (モデル) | `"1.16.0"` | 3Dモデル定義 |
| パーティクル | `"1.10.0"` | パーティクル効果 |

## format_version による挙動の違い

### アイテム

| format_version | 変更点 |
|---------------|--------|
| `"1.16.100"` | 実験的アイテムAPI（非推奨） |
| `"1.20.0"` | 新アイテムAPI開始 |
| `"1.20.50"` | menu_category導入 |
| `"1.21.0"` | minecraft:damage, 安定版 |

### ブロック

| format_version | 変更点 |
|---------------|--------|
| `"1.16.100"` | 実験的ブロックAPI |
| `"1.19.80"` | minecraft:geometry でカスタム形状 |
| `"1.20.0"` | 新ブロックAPI開始 |
| `"1.21.0"` | 安定版、推奨 |

### エンティティ

| format_version | 変更点 |
|---------------|--------|
| `"1.8.0"` | 基本エンティティ |
| `"1.16.0"` | コンポーネントグループ強化 |
| `"1.18.0"` | バイオームフィルター改善 |
| `"1.21.0"` | 最新安定版 |

## 注意事項

- **format_version は文字列として指定**する（manifest.json のみ数値 `2`）
- **新しすぎる format_version** を指定すると古いクライアントで動作しない
- **古い format_version** を使うと新しいコンポーネントが使えない
- format_version はファイルごとに独立して設定可能
