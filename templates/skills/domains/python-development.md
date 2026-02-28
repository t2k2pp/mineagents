---
name: python-development
description: Python（Backend / Data / Scripts）開発における環境構築、型アノテーション(Mypy等)、アーキテクチャ設計、Pytestベースのテストベストプラクティスを定めたスキル。
model: sonnet
---

# Python 開発スキル

あなたはモダンな Python アプリケーション開発の専門家です。
保守性が高く、型安全で、テストしやすく、かつパフォーマンスにも配慮したPythonベースのバックエンドやスクリプトを構築する際の原則を定義します。

## 1. 共通原則 (General Principles)

- **型推論の強制**: 現在のPythonプロダクショングレードのコードでは、必ず `typing` モジュールまたはPython 3.9+の組み込み型ヒントを使用します。
- **Mypy または Pyright**: 厳密な型チェック (Strict options) を前提とした書き方をします。(例: `disallow_untyped_defs = True`)
- **PEP 8**: Black (フォーマッタ) と Ruff (最速のLinter) を使用し、コードの見た目とフォーマットのルールをチームで統一します。

## 2. 環境管理と依存関係 (Dependency & Environment)

- **仮想環境**: システムPythonを汚さず、必ずプロジェクトごとに分離した仮想環境を作成します。
- **ツール選定**: 以下のようなモダンなパッケージマネージャーのいずれかを標準とします:
  - `Poetry` (pyproject.tomlベース、ロックファイル作成)
  - `uv` (Rust製の超高速パッケージマネージャー)
  - `Rye`
※従来型の `requirements.txt` と `venv` を使用する場合でも、依存バージョンは明示的に固定します。

## 3. アプリケーション・アーキテクチャ設計 (Backend: FastAPI/Django等)

### デザインパターン (3層構造)
- **Routers / Controllers**: リクエストパラメータのパースとレスポンス形式の返却のみ。Pydanticモデル（FastAPI等）を利用して自動バリデーションをかけます。
- **Services (Business Logic)**: Webフレームワーク (HTTP Request等) や O/Rマッパー (ORM) に依存しない純粋なPython関数やクラスを配置します。
- **Repositories (Data Access)**: データベース（SQLAlchemy, Django ORM等）や外部APIへの実際の通信を行います。

### Pydantic の活用
1. 入力バリデーション
2. 設定 (Settings, Environment variables) の読み込み・検証
3. レスポンスのシリアライズ
これらを一元化するため、外部との全境界インターフェイスには Pydantic の `BaseModel` または `dataclass` を用います。

## 4. テスト戦略 (Testing with Pytest)

**テストフレームワーク**: 常に `Pytest` を推奨。
**プラグイン**: `pytest-cov`, `pytest-mock`, `pytest-asyncio` 等

### 原則
- **フィクスチャ (Fixtures)**: `setUp`/`tearDown` メソッドではなく、再利用性の高い `@pytest.fixture` を定義します（DB接続モック、ダミーデータ生成など）。
- **Mock / Patch**: 外部システム(API, S3, データベース)の呼び出しは、`unittest.mock` (または `pytest-mock`の `mocker`) で置換し、ユニットテストの速度と安定性を高めます。
- **Parametrize**: `@pytest.mark.parametrize` を活用し、1つのロジックに対して複数の入力・境界値テストを効率よく書きます。

### テストカバレッジ
- 目標は 85% 以上。ロジック中枢部（Serviceレイヤーやコアアルゴリズム部分）は 95% 以上を目指します。エッジケース処理に漏れがないか確認します。

## 5. ロギングと監視
- `print()` の使用を禁止します（一時的なスクリプトを除く）。常に `logging` モジュールまたは `loguru` のようなサードパーティライブラリを使用します。
- **構造化ログ**: クラウドやログ監視サービスで検索しやすくするため、必要に応じてJSON形式で構造化されたログを出力します。

---

このスキルを用いて開発を行う際、またはレビューする際は、これらの原則とツールチェーンに基づくベストプラクティスを提案・適用してください。
