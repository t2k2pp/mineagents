# MineAgents - Minecraft Bedrock Addon Creator

統合版マインクラフト（Bedrock Edition）のアドオン（リソースパック / ビヘイビアパック）を対話的に作成するAIエージェント VSCode拡張機能。

## 特徴

- **AI対話でアドオン作成** – 自然言語で「ルビーの剣を追加して」と指示するだけ
- **ローカル＆クラウドLLM対応** – Ollama, LM Studio, OpenAI, Gemini
- **初心者にも上級者にも** – ガイドモード / フリーモード / テンプレートモード
- **テクスチャ自動生成** – Stable Diffusion連携でドット絵テクスチャを自動生成
- **実現可能性チェック** – MC仕様を考慮し、不可能な要望には代替案を提示
- **バリデーション** – 生成したアドオンの整合性を自動検証
- **パッケージ化** – .mcaddon形式でエクスポート

## 対応LLMバックエンド

| バックエンド | デフォルトURL | 状態 |
|------------|-------------|------|
| **Ollama** | `http://localhost:11434` | ✅ 対応 |
| **LM Studio** | `http://localhost:1234` | 🚧 予定 |
| **OpenAI** | API | 🚧 予定 |
| **Gemini** | API | 🚧 予定 |

## 開発

```bash
npm install
npm run dev      # watchモード
npm run test     # テスト
npm run build    # ビルド
npm run package  # VSIXパッケージ生成
```

## ライセンス

MIT
