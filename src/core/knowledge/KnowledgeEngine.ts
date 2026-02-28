// ============================================================
// MineAgents - ナレッジエンジン
// ドキュメント管理・検索・鮮度チェックの統括
// ============================================================

import * as path from 'path';
import { KnowledgeLoader, KnowledgeDocument } from './KnowledgeLoader';
import { KnowledgeIndex, SearchResult } from './KnowledgeIndex';

export interface KnowledgeSearchOptions {
    category?: string;
    maxResults?: number;
    targetMcVersion?: string;
}

export class KnowledgeEngine {
    private loader = new KnowledgeLoader();
    private index = new KnowledgeIndex();
    private documents: KnowledgeDocument[] = [];
    private knowledgeDir: string = '';

    /**
     * ナレッジベースを初期化
     */
    initialize(extensionPath: string): void {
        this.knowledgeDir = path.join(extensionPath, 'knowledge');
        this.reload();
    }

    /**
     * ドキュメントをリロード
     */
    reload(): void {
        this.documents = this.loader.loadAll(this.knowledgeDir);
        this.index.buildIndex(this.documents);
        console.log(`KnowledgeEngine: loaded ${this.documents.length} documents from ${this.knowledgeDir}`);
    }

    /**
     * キーワード検索
     */
    search(query: string, options?: KnowledgeSearchOptions): SearchResult[] {
        return this.index.search(query, options);
    }

    /**
     * ドキュメントをID指定で取得
     */
    getDocument(docId: string): KnowledgeDocument | undefined {
        return this.index.getDocument(docId);
    }

    /**
     * 全ドキュメントの鮮度レポート
     */
    getFreshnessReport(targetMcVersion?: string): string {
        const warnings = this.index.checkAllFreshness(targetMcVersion);
        if (warnings.length === 0) {
            return '✅ 全てのナレッジドキュメントは最新です。';
        }

        const lines = ['⚠️ 以下のナレッジドキュメントは更新が必要な可能性があります:\n'];
        for (const w of warnings) {
            lines.push(`- **${w.title}** (${w.docId}): ${w.warning}`);
        }
        return lines.join('\n');
    }

    /**
     * ドキュメント一覧を取得
     */
    listDocuments(): Array<{ id: string; title: string; category: string; mcVersionMax: string; updatedAt: string }> {
        return this.documents.map((d) => ({
            id: d.metadata.id,
            title: d.metadata.title,
            category: d.metadata.category,
            mcVersionMax: d.metadata.mcVersionMax,
            updatedAt: d.metadata.updatedAt,
        }));
    }

    /**
     * 検索結果をLLM向けテキストにフォーマット
     */
    formatSearchResults(results: SearchResult[]): string {
        if (results.length === 0) {
            return '該当するナレッジが見つかりませんでした。';
        }

        const lines: string[] = [];
        for (const r of results) {
            lines.push(`## 📖 ${r.title} (MC ${r.metadata.mcVersionMin}〜${r.metadata.mcVersionMax})`);
            lines.push(`情報源: ${r.metadata.source || '内部ナレッジ'}`);
            lines.push(`最終確認: ${r.metadata.sourceVerifiedAt || r.metadata.updatedAt}`);

            if (r.freshnessWarning) {
                lines.push(`\n${r.freshnessWarning}`);
            }

            lines.push('');
            for (const section of r.matchedSections) {
                if (section.heading) {
                    lines.push(`### ${section.heading}`);
                }
                lines.push(section.content);
                lines.push('');
            }
            lines.push('---');
        }

        return lines.join('\n');
    }
}
