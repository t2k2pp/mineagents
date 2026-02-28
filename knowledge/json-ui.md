---
id: json-ui
title: JSON UI システム リファレンス
category: component
tags: [ui, json_ui, screen, panel, label, image, button, data_binding, stack_panel, grid, factory, ui_defs, ユーザーインターフェース, UI, 画面, 交易, チャット, インベントリ]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://wiki.bedrock.dev/json-ui/json-ui-intro.html"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# JSON UI システム リファレンス

> MC Bedrock 1.16.0〜1.21.60 対象 | wiki.bedrock.dev + Microsoft Learn | 最終確認: 2026-02-28
> 注意: JSON UIは将来的にOre UIへ移行予定ですが、現時点では動作します。

## 概要

Bedrock Editionのゲーム内UIはJSON形式のファイルで定義されており、リソースパックで上書き可能です。
交易画面、インベントリ、チャットUI、設定画面などを改変できます。

## ファイル構成

```
RP/
  ui/
    _ui_defs.json           ← カスタムUIファイルの登録
    my_trade_screen.json    ← 改変したUI定義
```

## _ui_defs.json

全てのカスタムUIファイルをここに登録します。バニラファイルと同名のファイルは自動マージされます。

```json
{
    "ui_defs": [
        "ui/my_custom_screen.json"
    ]
}
```

**重要**: バニラの既存ファイル（例: `ui/trade2_screen.json`）と同名で配置すると自動的にオーバーライドされます。
_ui_defs.json に明示的に書かなくても、同名ファイルはマージされます。

## 基本的なUI要素

### パネル（panel）
他の要素をグループ化するコンテナ。要素は重なって表示されます。

```json
{
    "my_panel": {
        "type": "panel",
        "size": [200, 100],
        "anchor_from": "center",
        "anchor_to": "center",
        "controls": [
            { "child1@common.label": { "text": "Hello" } }
        ]
    }
}
```

### スタックパネル（stack_panel）
子要素を縦または横に並べて配置。

```json
{
    "my_stack": {
        "type": "stack_panel",
        "orientation": "vertical",
        "size": ["100%", "100%c"],
        "controls": []
    }
}
```

### ラベル（label）
テキスト表示。

```json
{
    "my_label": {
        "type": "label",
        "text": "表示テキスト",
        "color": [1.0, 1.0, 1.0, 1.0],
        "font_size": "normal",
        "shadow": true
    }
}
```

### イメージ（image）
テクスチャ画像の表示。

```json
{
    "my_image": {
        "type": "image",
        "texture": "textures/ui/my_texture",
        "size": [16, 16],
        "uv": [0, 0],
        "uv_size": [16, 16]
    }
}
```

### ボタン（button）

```json
{
    "my_button": {
        "type": "button",
        "size": [100, 20],
        "pressed_button_name": "button.my_action",
        "controls": [
            { "label@common.label": { "text": "Click Me" } }
        ]
    }
}
```

### グリッド（grid）
アイテムスロットなどをグリッド表示。

```json
{
    "my_grid": {
        "type": "grid",
        "grid_dimensions": [9, 3],
        "grid_item_template": "my_namespace.grid_item",
        "collection_name": "inventory_items"
    }
}
```

## サイズ指定

| 記法 | 意味 |
|------|------|
| `[200, 100]` | 固定 200×100px |
| `["100%", "100%"]` | 親の100% |
| `["100%c", "100%c"]` | 子要素に合わせる |
| `["fill", 20]` | 残りスペースを埋める |
| `["100% - 4px", "100%"]` | 計算式 |

## アンカー

| anchor_from / anchor_to | 位置 |
|------------------------|------|
| `"top_left"` | 左上 |
| `"top_middle"` | 上中央 |
| `"top_right"` | 右上 |
| `"left_middle"` | 左中央 |
| `"center"` | 中央 |
| `"right_middle"` | 右中央 |
| `"bottom_left"` | 左下 |
| `"bottom_middle"` | 下中央 |
| `"bottom_right"` | 右下 |

## データバインディング

ゲームのデータをUI要素にバインド（接続）します。

```json
{
    "trade_item_name": {
        "type": "label",
        "text": "#trade_item_name",
        "bindings": [
            {
                "binding_name": "#trade_item_name",
                "binding_name_override": "#trade_item_name",
                "binding_type": "collection",
                "binding_collection_name": "trade_items"
            }
        ]
    }
}
```

### binding_type
| type | 用途 |
|------|------|
| `"global"` | グローバルデータ |
| `"collection"` | コレクション（アイテムリスト等） |
| `"view"` | ビュー固有 |
| `"none"` | バインディングなし |

### よく使うバインディング名

| バインディング名 | 用途 |
|----------------|------|
| `#trade_item_name` | 交易アイテム名 |
| `#trade_item_count` | 交易アイテム数 |
| `#trade_price_different` | 値引き表示 |
| `#trade_cross_out` | ロック表示（打消し線） |
| `#is_tier_unlocked` | 層がアンロック済みか |
| `#item_id_aux` | アイテムID |
| `#hover_text` | ホバーテキスト |
| `#visible` | 表示/非表示 |

## 継承（@記法）

既存の要素定義を継承して、一部だけ変更できます。

```json
{
    "my_element@other_namespace.base_element": {
        "size": [100, 50],
        "$custom_var": "value"
    }
}
```

## 変数（$記法）

テンプレート変数で値をパラメータ化。

```json
{
    "template_element": {
        "type": "label",
        "text": "$label_text",
        "$label_text|default": "デフォルト値"
    }
}
```

## ファクトリー

データに基づいてUI要素を動的に生成。

```json
{
    "factory": {
        "type": "factory",
        "control_ids": {
            "trade_item": "@trade.trade_item_template"
        }
    }
}
```

## 条件表示

```json
{
    "conditional_element": {
        "type": "panel",
        "visible": "#is_visible",
        "bindings": [
            {
                "binding_name": "#is_visible",
                "binding_type": "global"
            }
        ]
    }
}
```

## バニラUIオーバーライドの手順

1. バニラリソースパックからUI JSONファイルをコピー
2. RPの `ui/` ディレクトリに同名で配置
3. 必要な部分だけ変更（変更しない要素はそのまま残す）
4. `_ui_defs.json` に追加ファイルを登録（同名ファイルは不要）

## 主要なバニラUIファイル

| ファイル | 画面 |
|---------|------|
| `ui/trade2_screen.json` | **村人交易画面** |
| `ui/inventory_screen.json` | インベントリ |
| `ui/crafting_screen.json` | クラフト画面 |
| `ui/chest_screen.json` | チェスト画面 |
| `ui/furnace_screen.json` | かまど画面 |
| `ui/anvil_screen.json` | 金床画面 |
| `ui/enchanting_screen.json` | エンチャント台画面 |
| `ui/start_screen.json` | スタート画面 |
| `ui/pause_screen.json` | ポーズ画面 |
| `ui/hud_screen.json` | HUD |
| `ui/chat_screen.json` | チャット |
