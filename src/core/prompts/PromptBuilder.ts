// ============================================================
// MineAgents - プロンプトビルダー
// ユーザーメッセージに関連するナレッジを自動検索しプロンプトに注入
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeEngine } from '../knowledge/KnowledgeEngine';

export class PromptBuilder {
    constructor(
        private knowledgeEngine: KnowledgeEngine,
        private targetMcVersion: string = '1.21.0',
    ) { }

    /**
     * システムプロンプトを構築
     * ベースプロンプト + フェーズガイダンス + 自動ナレッジ注入
     */
    build(options: {
        extensionPath: string;
        phaseGuidance?: string;
        interactionMode: string;
        userMessage?: string;
    }): string {
        let prompt = this.loadBasePrompt(options.extensionPath);

        // フェーズガイダンス
        if (options.phaseGuidance) {
            prompt += `\n\n## 現在のフェーズ指示\n${options.phaseGuidance}`;
        }

        // インタラクションモード
        prompt += `\n\n## 現在のインタラクションモード: ${options.interactionMode}`;

        // 自動ナレッジ注入（ユーザーメッセージから関連知識を検索）
        if (options.userMessage) {
            const contextKnowledge = this.getRelevantKnowledge(options.userMessage);
            if (contextKnowledge) {
                prompt += `\n\n## 参照ナレッジ（自動検索結果）\n以下は関連する公式仕様情報です。この情報を基に回答してください。\n\n${contextKnowledge}`;
            }
        }

        return prompt;
    }

    /**
     * ユーザーメッセージから関連知識を自動検索
     */
    private getRelevantKnowledge(userMessage: string): string | null {
        const results = this.knowledgeEngine.search(userMessage, {
            maxResults: 2,
            targetMcVersion: this.targetMcVersion,
        });

        if (results.length === 0) return null;
        return this.knowledgeEngine.formatSearchResults(results);
    }

    /**
     * ベースプロンプトを読み込む
     */
    private loadBasePrompt(extensionPath: string): string {
        const promptPath = path.join(extensionPath, 'src', 'core', 'prompts', 'templates', 'addon-expert.md');
        try {
            return fs.readFileSync(promptPath, 'utf-8');
        } catch {
            return this.getDefaultPrompt();
        }
    }

    private getDefaultPrompt(): string {
        return `# Minecraft Bedrock Edition アドオン開発 専門家

あなたは統合版マインクラフト（Bedrock Edition）のアドオン開発の専門家エージェント「MineAgents」です。
リソースパックとビヘイビアパックの作成を支援します。

ユーザーの希望を聞き取り、実現可能なMinecraftアドオンを設計・生成してください。
実現不可能な要望には代替案を必ず提示してください。
承認を得てからファイルを生成してください。

**重要: コンポーネントやformat_versionについて推測せず、必ず query_knowledge ツールで確認してください。**`;
    }
}
