# MineAgents 🧱⛏️

**統合版マインクラフト（Bedrock Edition）のアドオンを、AIと対話して作成する VSCode 拡張機能**

「ルビーの剣を追加して」と話しかけるだけで、リソースパック・ビヘイビアパックの JSON ファイル群を自動生成します。

---

## ✨ 特徴

| 機能 | 説明 |
|------|------|
| **AI対話でアドオン作成** | 自然言語で指示 → アイテム・ブロック・レシピ・エンティティを自動生成 |
| **ローカル＆クラウドLLM対応** | Ollama, LM Studio, OpenAI, Gemini |
| **3つのインタラクションモード** | ガイド（初心者向け）/ フリー（上級者向け）/ テンプレート |
| **テクスチャ自動生成** | Stable Diffusion (ComfyUI) 連携でドット絵テクスチャ作成 |
| **ナレッジベース搭載** | MC公式仕様に基づくローカル知識DB。LLMの幻覚を防止 |
| **実現可能性チェック** | MC仕様制約を考慮し、不可能な要望には代替案を提示 |
| **バリデーション＆パッケージ** | 生成アドオンの整合性検証 → `.mcaddon` エクスポート |

---

## 🚀 セットアップ

### 前提条件

- **Node.js** v18以上
- **VSCode** v1.85以上
- **LLMサーバー**（以下のいずれか）

| バックエンド | デフォルトURL | 説明 |
|------------|-------------|------|
| **Ollama** | `http://localhost:11434` | ローカルLLM推奨。無料 |
| **LM Studio** | `http://localhost:1234` | GUIベースのローカルLLM |
| **OpenAI** | `https://api.openai.com/v1` | クラウド。APIキー必要 |
| **Gemini** | `https://generativelanguage.googleapis.com/v1` | クラウド。APIキー必要 |

### 1. リポジトリのクローン

```bash
git clone https://github.com/t2k2pp/mineagents.git
cd mineagents
```

### 2. 依存関係のインストール

```bash
npm install
cd webview-ui && npm install && cd ..
```

### 3. ビルド

```bash
npm run build
```

### 4. VSCode拡張としてインストール

#### 方法A: 開発モードで起動（推奨・開発時）

1. VSCodeでプロジェクトフォルダを開く
2. `F5` キーを押す → 拡張機能開発ホストが起動
3. 新しいVSCodeウィンドウでMineAgentsパネルが利用可能に

```bash
# watchモード（ファイル変更を自動ビルド）
npm run dev
```

#### 方法B: VSIXパッケージとしてインストール（配布時）

```bash
# VSIXパッケージを生成
npm run package
```

生成された `mineagents-0.1.0.vsix` を以下の方法でインストール:

```bash
# コマンドラインから
code --install-extension mineagents-0.1.0.vsix
```

または VSCode 内で:
1. `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
2. 生成された `.vsix` ファイルを選択

---

## ⚙️ 設定

VSCode の設定画面（`Ctrl+,`）で `mineagents` を検索するか、`settings.json` に以下を記述:

```jsonc
{
    // === LLMプロバイダー ===
    "mineagents.provider.backendType": "ollama",       // ollama | lmstudio | openai | gemini
    "mineagents.provider.baseUrl": "http://localhost:11434",
    "mineagents.provider.apiKey": "",                   // クラウドLLM用
    "mineagents.provider.modelId": "qwen2.5:14b",      // 使用するモデル

    // === エージェント設定 ===
    "mineagents.agent.interactionMode": "guide",        // guide | free | template
    "mineagents.agent.maxIterations": 25,               // 最大ループ回数
    "mineagents.agent.temperature": 0,                  // LLM Temperature

    // === テクスチャ生成（オプション） ===
    "mineagents.stableDiffusion.enabled": false,
    "mineagents.stableDiffusion.baseUrl": "http://localhost:8188",  // ComfyUI URL

    // === 承認設定 ===
    "mineagents.approval.autoApproveWrites": false      // ファイル書込の自動承認
}
```

### Ollama の場合の推奨モデル

```bash
# ツール呼び出し対応モデルを推奨
ollama pull qwen2.5:14b
# または
ollama pull llama3.1:8b
```

---

## 📖 使い方

### 基本的な流れ

1. VSCode でアドオンを作りたいフォルダを開く
2. サイドバーの **MineAgents** パネルを開く
3. チャット欄に要望を入力

### 使用例

#### カスタムアイテムの作成

```
ルビーの剣を作って。ダイヤの剣よりちょっと強くしたい
```

エージェントは以下を自動実行:
1. `query_knowledge` でアイテムコンポーネント仕様を確認
2. 計画を提示して承認を求める
3. `create_addon_project` でプロジェクト構造を作成
4. `add_item` でルビーの剣を追加（攻撃力8、耐久値1800）
5. `add_recipe` でクラフトレシピを追加
6. `validate_addon` で整合性チェック

#### カスタムブロックの作成

```
光るルビーブロックを追加して。ダイヤブロックくらいの硬さで
```

#### レシピの追加

```
ルビー9個でルビーブロックを作れるようにして
```

#### パッケージ化

```
アドオンをmcaddonファイルにまとめて
```

### インタラクションモード

| モード | 対象者 | 特徴 |
|-------|--------|------|
| **guide** | 初心者 | ステップバイステップで質問。選択肢を提示 |
| **free** | 上級者 | 自然言語やJSON直接記述。最小限の確認 |
| **template** | 全般 | 「カスタム武器」「カスタムモブ」等の型から開始 |

---

## 📚 ナレッジベース

エージェントはLLMの知識だけに頼らず、ローカルの**検証済み仕様ドキュメント**を参照してアドオンを生成します。

### 搭載ナレッジ（10種）

| ドキュメント | 内容 |
|------------|------|
| `format-versions.md` | format_version 互換性テーブル |
| `manifest.md` | manifest.json の全フィールド仕様 |
| `items.md` | アイテムコンポーネント 15種以上 |
| `blocks.md` | ブロックコンポーネント 15種以上 |
| `entities.md` | エンティティコンポーネント 25種以上 |
| `recipes.md` | レシピ 3種（shaped/shapeless/furnace） |
| `loot-tables.md` | ルートテーブル構造 |
| `textures.md` | テクスチャ仕様（サイズ・マッピング） |
| `vanilla-identifiers.md` | バニラ ID 60種以上 |
| `constraints.md` | 仕様制約＋代替案テーブル |

### バージョン管理

各ドキュメントには以下のメタデータが記録されており、古い情報は自動で警告されます:

```yaml
mc_version_min: "1.21.0"          # 対応MCバージョン（最低）
mc_version_max: "1.21.60"         # 対応MCバージョン（確認済み最新）
updated_at: "2026-02-28"          # 最終更新日
source: "https://learn.microsoft.com/..."  # 情報源
freshness_days: 180               # この日数超過で古い情報の警告
```

### ナレッジの更新方法

MCアップデートがあった場合:

1. `knowledge/` ディレクトリ内の該当 `.md` ファイルを開く
2. 内容を最新仕様に合わせて修正
3. Frontmatter の `updated_at`, `mc_version_max`, `source_verified_at` を更新
4. 拡張機能を再起動すると自動的に反映

---

## 🏗️ プロジェクト構成

```
mineagents/
├── knowledge/                   # ナレッジベース（MC仕様ドキュメント10種）
├── src/
│   ├── extension.ts             # 拡張エントリポイント
│   ├── core/
│   │   ├── agent/AgentLoop.ts   # LLM⇔ツール自律ループ
│   │   ├── knowledge/           # ナレッジ検索エンジン
│   │   │   ├── KnowledgeEngine.ts
│   │   │   ├── KnowledgeIndex.ts
│   │   │   └── KnowledgeLoader.ts
│   │   ├── llm/                 # LLMプロバイダー群
│   │   │   ├── ProviderRegistry.ts
│   │   │   ├── OpenAiCompatibleProvider.ts
│   │   │   └── backends/       # Ollama, OpenAI, Gemini, LMStudio
│   │   ├── prompts/
│   │   │   ├── PromptBuilder.ts
│   │   │   └── templates/addon-expert.md
│   │   └── tools/               # 基本ツール (read/write/list/ask/complete)
│   ├── minecraft/
│   │   ├── generators/          # JSON生成 (Manifest, Item, Block, Recipe)
│   │   ├── tools/               # MC Addonツール (create_project, add_item等)
│   │   ├── validators/          # アドオンバリデーター
│   │   ├── packaging/           # .mcaddon/.mcpackビルダー
│   │   ├── resources/           # Stable Diffusion連携
│   │   ├── conversation/        # 対話フローマネージャー
│   │   └── knowledge/           # ケイパビリティマップ
│   ├── webview/                 # WebviewProvider
│   └── types/                   # 型定義
├── webview-ui/                  # React + Zustand チャットUI
│   ├── src/
│   │   ├── components/chat/     # ChatView, InputArea
│   │   └── state/store.ts       # Zustand ストア
│   └── package.json
└── package.json                 # VSCode拡張マニフェスト
```

---

## 🔧 登録ツール一覧（13種）

| ツール | 承認 | 説明 |
|-------|------|------|
| `query_knowledge` | — | MC仕様をナレッジベースから検索 |
| `read_file` | — | ファイル読取 |
| `write_file` | ✅ | ファイル書込 |
| `list_files` | — | ディレクトリ一覧 |
| `ask_user` | — | ユーザーへの質問 |
| `task_complete` | — | タスク完了報告 |
| `create_addon_project` | ✅ | RP/BP構造+manifest一括生成 |
| `add_item` | ✅ | カスタムアイテム追加 |
| `add_block` | ✅ | カスタムブロック追加 |
| `add_recipe` | ✅ | レシピ追加 |
| `validate_addon` | — | アドオン整合性検証 |
| `package_addon` | ✅ | .mcaddon/.mcpackビルド |

---

## 🧪 開発コマンド

```bash
npm install              # 依存関係インストール
npm run dev              # watchモード（extension + webview）
npm run build            # プロダクションビルド
npm run test             # テスト実行
npm run lint             # Lint実行
npm run package          # VSIXパッケージ生成
npx tsc --noEmit         # 型チェック
```

---

## 📝 テクスチャ生成（オプション）

別PCで ComfyUI を起動し、設定でURLを指定すると、アイテム・ブロックのテクスチャをAIで自動生成できます。

```bash
# ComfyUI側の設定
# sd_v1-5.safetensors をモデルに配置
# --listen 0.0.0.0 で外部アクセスを許可
python main.py --listen 0.0.0.0 --port 8188
```

VSCode設定:
```json
{
    "mineagents.stableDiffusion.enabled": true,
    "mineagents.stableDiffusion.baseUrl": "http://192.168.x.x:8188"
}
```

---

## ライセンス

MIT
