---
id: vanilla-ui-screens
title: バニラUI画面構造リファレンス
category: reference
tags: [ui, screen, trade, trade2, inventory, chest, hud, vanilla, override, 交易, 村人, インベントリ, チェスト, UI改変]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://wiki.bedrock.dev/json-ui/json-ui-intro.html"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# バニラUI画面構造リファレンス

> MC Bedrock 1.16.0〜1.21.60 対象 | wiki.bedrock.dev | 最終確認: 2026-02-28

## 交易画面（trade2_screen.json）

交易画面はTradingHelper等のUI改変リソースパックで最もよく改変される画面です。

### 主要な構造

```
trade2_screen
├── trade_container          ← 交易UIのメインコンテナ
│   ├── trade_item_list      ← 交易アイテム一覧（左側スクロールリスト）
│   │   └── trade_item       ← 各交易アイテム行
│   │       ├── input_items  ← 入力アイテム（支払うもの）
│   │       ├── result_item  ← 結果アイテム（得られるもの）
│   │       └── trade_toggle ← 交易行のクリック判定
│   ├── trade_slots          ← 交易スロット（右側）
│   │   ├── input_slot_1     ← 入力スロット1
│   │   ├── input_slot_2     ← 入力スロット2（任意）
│   │   └── output_slot      ← 出力スロット
│   └── villager_exp_bar     ← 村人経験値バー
```

### ロック交易の表示改変

Trading Helperのような「ロックされた交易を見えるようにする」パックは以下を改変します:

```json
{
    "namespace": "trade2",

    "locked_trade_overlay": {
        "type": "panel",
        "visible": false
    },

    "trade_item_name_label": {
        "type": "label",
        "text": "#trade_item_name",
        "shadow": true,
        "color": [1.0, 1.0, 1.0, 1.0],
        "bindings": [
            {
                "binding_name": "#trade_item_name",
                "binding_type": "collection",
                "binding_collection_name": "trade_items"
            }
        ]
    },

    "locked_trade_item": {
        "type": "panel",
        "visible": true,
        "alpha": 0.6,
        "controls": [
            { "item@trade2.trade_item_name_label": {} }
        ]
    }
}
```

**ポイント**:
1. `locked_trade_overlay` の `visible` を `false` にして暗転オーバーレイを消す
2. ロックされたエントリの `alpha` を下げてグレーアウト表示にする
3. アイテム名ラベルに `#trade_item_name` をバインドして常に表示
4. エンチャント情報は `#hover_text` バインディングで取得可能

### よく使う交易関連バインディング

| バインディング名 | 型 | 用途 |
|----------------|-----|------|
| `#trade_item_name` | string | 交易アイテム名 |
| `#trade_item_count` | int | アイテム個数 |
| `#trade_price_different` | bool | 値引き中か |
| `#trade_cross_out` | bool | ロックで交差線表示か |
| `#single_slash_visible` | bool | 交差線1本表示か |
| `#double_slash_visible` | bool | 交差線2本表示か |
| `#trade_possible` | bool | 交易可能か |
| `#trade_toggle_state` | bool | 交易行選択状態 |
| `#hover_text` | string | ホバーテキスト（エンチャント情報含む） |
| `#item_id_aux` | int | アイテムID |
| `#is_tier_unlocked` | bool | 層（レベル）がアンロック済みか |
| `#tier_visible` | bool | 層が表示されるか |
| `#villager_level_info` | string | 村人レベル情報 |
| `#exp_bar_visible` | bool | 経験値バー表示か |

## インベントリ画面（inventory_screen.json）

### 主要構造
```
inventory_screen
├── inventory_panel
│   ├── armor_slots       ← 防具スロット（4箇所）
│   ├── offhand_slot      ← オフハンドスロット
│   ├── hotbar            ← ホットバー（9スロット）
│   └── inventory_grid    ← インベントリ（27スロット、3×9グリッド）
```

## HUD画面（hud_screen.json）

### 主要構造
```
hud_screen
├── hotbar_panel          ← ホットバー表示
├── health_panel          ← 体力バー
├── hunger_panel          ← 空腹バー
├── armor_panel           ← 防御バー
├── experience_panel      ← 経験値バー
├── boss_health_panel     ← ボスHP
├── chat_panel            ← チャットログ
├── actionbar_text        ← アクションバーテキスト
└── title_text            ← タイトルテキスト
```

## UI改変リソースパック作成の基本手順

### 1. プロジェクト構造を作成
```
my_ui_pack/
├── manifest.json           ← format_version: 2, type: "resources"
├── pack_icon.png           ← パックアイコン
└── ui/
    ├── _ui_defs.json       ← 追加したカスタムファイルの登録
    └── trade2_screen.json  ← 改変するUI定義
```

### 2. manifest.json
```json
{
    "format_version": 2,
    "header": {
        "name": "Trading Helper",
        "description": "Makes locked trades visible",
        "uuid": "unique-uuid-here",
        "version": [1, 0, 0],
        "min_engine_version": [1, 21, 0]
    },
    "modules": [
        {
            "type": "resources",
            "uuid": "different-uuid",
            "version": [1, 0, 0]
        }
    ]
}
```

### 3. UI改変のコツ

- **最小限の変更**: バニラの定義を全コピーせず、変更する要素だけ記述
- **namespace**: バニラのnamespaceと同じにすると自動マージ
- **テスト**: 変更後はゲーム内で動作確認が必須
- **互換性**: 他のUIパックと競合する可能性あり（同じ要素を変更する場合）
