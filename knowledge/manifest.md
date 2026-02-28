---
id: manifest
title: manifest.json 構造リファレンス
category: structure
tags: [manifest, uuid, header, modules, dependencies, pack]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/examples/addonmanifest"
source_verified_at: "2026-02-28"
freshness_days: 365
---

# manifest.json 構造リファレンス

> MC Bedrock 1.16.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## 基本構造

```json
{
    "format_version": 2,
    "header": {
        "name": "パック名",
        "description": "パックの説明",
        "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
        "version": [1, 0, 0],
        "min_engine_version": [1, 21, 0]
    },
    "modules": [
        {
            "type": "resources | data | script",
            "uuid": "別のUUID",
            "version": [1, 0, 0]
        }
    ],
    "dependencies": []
}
```

## フィールド詳細

### format_version
- **型**: 数値（整数）
- **値**: `2` 固定
- **注意**: 文字列ではなく数値

### header.uuid
- **型**: 文字列（UUID v4）
- **ルール**: パック全体で一意。他のパックと重複不可
- **生成**: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` 形式

### header.version
- **型**: 配列 `[major, minor, patch]`
- **例**: `[1, 0, 0]`
- **ルール**: 更新時にインクリメント

### header.min_engine_version
- **型**: 配列 `[major, minor, patch]`
- **例**: `[1, 21, 0]`
- **意味**: このパックが動作する最低MCバージョン

### modules[].type
| type | 用途 |
|------|------|
| `"resources"` | リソースパック（テクスチャ、モデル、サウンド） |
| `"data"` | ビヘイビアパック（エンティティ、アイテム、ブロック） |
| `"script"` | Script API（@minecraft/server等） |

### modules[].uuid
- header.uuid とは**別のUUID**を使用すること

### dependencies
- **RP⇔BP連携**: BPのmanifestにRPのheader.uuidを依存として記載
- **Script API**: `@minecraft/server` 等のモジュールUUIDを依存に追加

```json
"dependencies": [
    {
        "uuid": "RPのheader.uuid",
        "version": [1, 0, 0]
    }
]
```

## よくある間違い

| 間違い | 正しい |
|--------|--------|
| format_version を `"2"` (文字列) | `2` (数値) |
| header.uuid と modules.uuid が同じ | 別々のUUIDを使う |
| RPとBPで同じUUID | パックごとに別UUID |
| min_engine_version を省略 | 必ず指定する |
| dependencies の version を省略 | RPの version と一致させる |
