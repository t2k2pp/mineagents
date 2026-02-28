---
description: ソースコードのビルド、型チェック、Lint、テスト、セキュリティ検証を行うPR前統合検証ワークフロー
---

# 統合検証コマンド (Verification Command)

このコマンドは現在のコードベース全体に対する包括的な品質検証を実行します。
プルリクエスト（PR）の作成前や、大きな機能実装の完了時に実行してください。

## 実行手順 (Instructions)

以下の順序で正確に検証を実行してください。エラーが発生した場合はその時点でユーザーに報告し、次のステップへは進まないでください。

### 1. ビルドチェック (Build Check)
- プロジェクトのビルドコマンドを実行する（例: `npm run build`, `flutter build`, `go build` 等）。
- 失敗した場合はエラー内容を報告し、ここで STOP します。

### 2. 型チェック (Type Check)
- TypeScript等の型チェッカーがある場合は実行する（例: `npm run typecheck`, `tsc --noEmit`）。
- エラーが発生した場合、ファイル名と行番号を含むリストを報告します。

### 3. Lint チェック (Lint Check)
- プロジェクトに設定されたLinterを実行する（例: `npm run lint`, `flutter analyze`）。
- 全ての警告とエラーを報告します。

### 4. テストスイートの実行 (Test Suite)
- 全てのテストを実行する（例: `npm test`, `pytest`, `flutter test`）。
- パス/失敗の数と、カバレッジパーセンテージ（取得可能な場合）を報告します。

### 5. コンソールログ・デバッグコード監査 (Logging Audit)
- ソースファイルから `console.log` や `print` や `TODO: ` などのデバッグ用残骸を検索します。
- 見つかったファイルのパスと位置を報告します。

### 6. シークレット監査 (Secrets Audit)
- `.env`の内容がコードに直書きされていないか、APIキーやトークンがプレーンテキストで含まれていないか検索します。

### 7. Gitステータス確認 (Git Status)
- コミットされていない変更、または前回のコミットから変更されたファイル一覧を表示します。

## アウトプットフォーマット

最後に出力する検証レポートは、以下のフォーマットに準拠してください：

```markdown
## VERIFICATION REPORT: [PASS/FAIL]

- **Build**:    [OK / FAIL]
- **Types**:    [OK / 〇 errors]
- **Lint**:     [OK / 〇 issues]
- **Tests**:    [〇/〇 passed, 〇% coverage]
- **Secrets**:  [OK / 〇 found]
- **Logs**:     [OK / 〇 debug codes found]


### 判断結果
Ready for PR: [YES / NO]

*(もし NO の場合、以下のリストに修正推奨事項を記述)*
- [修正すべき重大な問題点1]
- [修正すべき重大な問題点2]
```
