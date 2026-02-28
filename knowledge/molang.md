---
id: molang
title: Molang クエリ・式リファレンス
category: reference
tags: [molang, query, render_controller, animation, expression, math, 体力バー, health_bar, レンダーコントローラー, アニメーション, 条件]
mc_version_min: "1.16.0"
mc_version_max: "1.21.60"
created_at: "2026-02-28"
updated_at: "2026-02-28"
source: "https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/"
source_verified_at: "2026-02-28"
freshness_days: 180
---

# Molang クエリ・式リファレンス

> MC Bedrock 1.16.0〜1.21.60 対象 | Microsoft Learn | 最終確認: 2026-02-28

## Molangとは

Molangはレンダーコントローラー、アニメーション、アニメーションコントローラー、パーティクル内で使える式言語です。
**RPのレンダリング内で使用可能 → 実績✅ のまま高度な表現ができます。**

## 使用場所

| 場所 | パック | 実績 | 用途 |
|------|--------|------|------|
| レンダーコントローラー | RP | ✅ | テクスチャ切替、ジオメトリ切替、色変更 |
| アニメーション | RP | ✅ | ボーンのposition/rotation/scaleを制御 |
| アニメーションコントローラー | RP | ✅ | 状態遷移の条件 |
| パーティクル | RP | ✅ | パーティクルの動き・色 |
| BP エンティティ | BP | ❌ | フィルター条件 |

## 主要クエリ（エンティティ）

### 体力・状態

| クエリ | 戻り値 | パック | 説明 |
|--------|--------|--------|------|
| `q.health` | float | RP/BP | 現在の体力 |
| `q.max_health` | float | RP/BP | 最大体力 |
| `q.is_alive` | bool | RP/BP | 生きているか |
| `q.is_baby` | bool | RP | 子供か |
| `q.is_on_fire` | bool | RP | 燃えているか |
| `q.is_in_water` | bool | RP | 水中か |
| `q.is_sneaking` | bool | RP | スニーク中か |
| `q.is_sprinting` | bool | RP | ダッシュ中か |
| `q.is_swimming` | bool | RP | 泳いでいるか |
| `q.is_sleeping` | bool | RP | 寝ているか |
| `q.is_riding` | bool | RP | 騎乗中か |

### 位置・動き

| クエリ | 戻り値 | 説明 |
|--------|--------|------|
| `q.position(0)` | float | X座標 |
| `q.position(1)` | float | Y座標 |
| `q.position(2)` | float | Z座標 |
| `q.body_y_rotation` | float | 体の向き（度） |
| `q.head_y_rotation` | float | 頭の左右回転 |
| `q.head_x_rotation` | float | 頭の上下回転 |
| `q.ground_speed` | float | 地上移動速度 |
| `q.modified_distance_moved` | float | 移動距離 |

### 環境

| クエリ | 戻り値 | 説明 |
|--------|--------|------|
| `q.time_of_day` | float | ゲーム内時刻（0.0〜1.0） |
| `q.moon_phase` | int | 月のフェーズ（0〜7） |
| `q.is_in_water_or_rain` | bool | 水中か雨中か |
| `q.distance_from_camera` | float | カメラからの距離 |

### 装備・アイテム

| クエリ | 戻り値 | 説明 |
|--------|--------|------|
| `q.is_item_equipped('main_hand')` | bool | アイテムを持っているか |
| `q.equipped_item_any_tag('slot.weapon.mainhand', 'tag_name')` | bool | 特定タグのアイテムを装備しているか |

## 数学関数

| 関数 | 説明 |
|------|------|
| `math.abs(x)` | 絶対値 |
| `math.sin(x)` | サイン（度） |
| `math.cos(x)` | コサイン（度） |
| `math.floor(x)` | 切り捨て |
| `math.ceil(x)` | 切り上げ |
| `math.clamp(value, min, max)` | 範囲制限 |
| `math.lerp(start, end, t)` | 線形補間 |
| `math.min(a, b)` | 最小値 |
| `math.max(a, b)` | 最大値 |
| `math.mod(a, b)` | 剰余 |
| `math.random(min, max)` | 乱数 |

## 演算子

`+`, `-`, `*`, `/`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`, `? :`（三項演算子）

## 実践例：モブ体力バー（RPのみ、実績✅）

### ジオメトリ（healthbar_geo.json）

体力バーとなる薄い板状のボーンを追加:
```json
{
    "format_version": "1.16.0",
    "minecraft:geometry": [{
        "description": { "identifier": "geometry.healthbar", "texture_width": 16, "texture_height": 16 },
        "bones": [{
            "name": "healthbar",
            "pivot": [0, 0, 0],
            "cubes": [{ "origin": [-8, 0, 0], "size": [16, 1, 0.1], "uv": [0, 0] }]
        }]
    }]
}
```

### レンダーコントローラー

体力に応じてバーの幅をスケーリング:
```json
{
    "format_version": "1.10.0",
    "render_controllers": {
        "controller.render.healthbar": {
            "geometry": "geometry.healthbar",
            "materials": [["*", "material.default"]],
            "textures": ["texture.healthbar"],
            "part_visibility": [{
                "healthbar": "q.health > 0"
            }],
            "color": {
                "r": "math.clamp(1.0 - (q.health / q.max_health), 0, 1)",
                "g": "math.clamp(q.health / q.max_health, 0, 1)",
                "b": 0,
                "a": 0.8
            },
            "uv_anim": {
                "offset": [0, 0],
                "size": ["math.clamp(q.health / q.max_health, 0, 1) * 16", 1]
            }
        }
    }
}
```

### クライアントエンティティ定義への追加

バニラエンティティの定義に体力バー用レンダーコントローラーを追加:
```json
"render_controllers": [
    { "controller.render.zombie": "q.variant == 0" },
    "controller.render.healthbar"
]
```
