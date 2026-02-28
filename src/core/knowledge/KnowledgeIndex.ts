// ============================================================
// MineAgents - ナレッジインデックス
// 転置インデックスによるキーワード検索
// ============================================================

import { KnowledgeDocument, KnowledgeSection } from './KnowledgeLoader';

export interface SearchResult {
    docId: string;
    title: string;
    score: number;
    matchedSections: KnowledgeSection[];
    metadata: KnowledgeDocument['metadata'];
    freshnessWarning?: string;
}

export class KnowledgeIndex {
    /** docId → ドキュメント */
    private documents = new Map<string, KnowledgeDocument>();
    /** キーワード → { docId, sectionIdx, count }[] */
    private invertedIndex = new Map<string, Array<{ docId: string; sectionIdx: number; count: number }>>();

    /**
     * ドキュメント群をインデックスに追加
     */
    buildIndex(docs: KnowledgeDocument[]): void {
        this.documents.clear();
        this.invertedIndex.clear();

        for (const doc of docs) {
            this.documents.set(doc.metadata.id, doc);

            // タグをインデックス
            for (const tag of doc.metadata.tags) {
                this.addToIndex(tag.toLowerCase(), doc.metadata.id, -1, 3); // タグは高スコア
            }

            // タイトルをインデックス
            for (const word of this.tokenize(doc.metadata.title)) {
                this.addToIndex(word, doc.metadata.id, -1, 2);
            }

            // 各セクションをインデックス
            for (let i = 0; i < doc.sections.length; i++) {
                const section = doc.sections[i];
                // 見出しのキーワード
                for (const word of this.tokenize(section.heading)) {
                    this.addToIndex(word, doc.metadata.id, i, 2);
                }
                // 本文のキーワード
                for (const word of this.tokenize(section.content)) {
                    this.addToIndex(word, doc.metadata.id, i, 1);
                }
            }
        }
    }

    /**
     * キーワードで検索
     */
    search(query: string, options?: { category?: string; maxResults?: number; targetMcVersion?: string }): SearchResult[] {
        const queryWords = this.tokenize(query);
        const maxResults = options?.maxResults ?? 5;

        // スコア集計: docId → { score, matchedSectionIndices }
        const scores = new Map<string, { score: number; matchedSections: Set<number> }>();

        for (const word of queryWords) {
            // 完全一致
            const exact = this.invertedIndex.get(word);
            if (exact) {
                for (const entry of exact) {
                    const s = scores.get(entry.docId) ?? { score: 0, matchedSections: new Set() };
                    s.score += entry.count * 2; // 完全一致は2倍
                    if (entry.sectionIdx >= 0) s.matchedSections.add(entry.sectionIdx);
                    scores.set(entry.docId, s);
                }
            }

            // 前方一致（ファジー）
            for (const [key, entries] of this.invertedIndex) {
                if (key !== word && (key.startsWith(word) || word.startsWith(key))) {
                    for (const entry of entries) {
                        const s = scores.get(entry.docId) ?? { score: 0, matchedSections: new Set() };
                        s.score += entry.count * 0.5; // 部分一致は半分
                        if (entry.sectionIdx >= 0) s.matchedSections.add(entry.sectionIdx);
                        scores.set(entry.docId, s);
                    }
                }
            }
        }

        // カテゴリフィルタ
        let results = Array.from(scores.entries())
            .filter(([docId]) => {
                const doc = this.documents.get(docId);
                if (!doc) return false;
                if (options?.category && doc.metadata.category !== options.category) return false;
                return true;
            })
            .map(([docId, { score, matchedSections }]) => {
                const doc = this.documents.get(docId)!;
                const sections = Array.from(matchedSections)
                    .filter((i) => i >= 0 && i < doc.sections.length)
                    .map((i) => doc.sections[i]);

                const result: SearchResult = {
                    docId,
                    title: doc.metadata.title,
                    score,
                    matchedSections: sections.length > 0 ? sections : doc.sections.slice(0, 3),
                    metadata: doc.metadata,
                };

                // 鮮度チェック
                const warning = this.checkFreshness(doc.metadata, options?.targetMcVersion);
                if (warning) result.freshnessWarning = warning;

                return result;
            })
            .sort((a, b) => b.score - a.score);

        return results.slice(0, maxResults);
    }

    /**
     * ドキュメントを直接取得
     */
    getDocument(docId: string): KnowledgeDocument | undefined {
        return this.documents.get(docId);
    }

    /**
     * 全ドキュメントの鮮度をチェック
     */
    checkAllFreshness(targetMcVersion?: string): Array<{ docId: string; title: string; warning: string }> {
        const warnings: Array<{ docId: string; title: string; warning: string }> = [];
        for (const [docId, doc] of this.documents) {
            const w = this.checkFreshness(doc.metadata, targetMcVersion);
            if (w) warnings.push({ docId, title: doc.metadata.title, warning: w });
        }
        return warnings;
    }

    // ============================================================
    // 内部メソッド
    // ============================================================

    private addToIndex(word: string, docId: string, sectionIdx: number, weight: number): void {
        const entries = this.invertedIndex.get(word) ?? [];
        const existing = entries.find((e) => e.docId === docId && e.sectionIdx === sectionIdx);
        if (existing) {
            existing.count += weight;
        } else {
            entries.push({ docId, sectionIdx, count: weight });
        }
        this.invertedIndex.set(word, entries);
    }

    private tokenize(text: string): string[] {
        if (!text) return [];
        // 英数字・日本語で分割、minecraft:xxx はそのまま
        const mcIds = text.match(/minecraft:\S+/g) ?? [];
        const cleaned = text
            .replace(/minecraft:\S+/g, '') // MC ID は別途処理
            .replace(/[`*#\-|>{}()\[\]"']/g, ' ')
            .toLowerCase();

        // 英単語
        const enWords = cleaned.match(/[a-z_][a-z0-9_]{1,}/g) ?? [];
        // 日本語 (2文字以上のひらがな/カタカナ/漢字)
        const jaWords = cleaned.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}/g) ?? [];

        return [...mcIds.map((w) => w.toLowerCase()), ...enWords, ...jaWords].filter(Boolean);
    }

    /**
     * ドキュメントの鮮度をチェックし、警告メッセージを返す
     */
    private checkFreshness(metadata: KnowledgeDocument['metadata'], targetMcVersion?: string): string | undefined {
        const warnings: string[] = [];

        // 1. 日数による鮮度チェック
        if (metadata.updatedAt) {
            const updatedDate = new Date(metadata.updatedAt);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff > metadata.freshnessDays) {
                warnings.push(`⚠️ この情報は${daysDiff}日前のものです（最終更新: ${metadata.updatedAt}）。最新版では変更されている可能性があります。`);
            }
        }

        // 2. MCバージョン乖離チェック
        if (targetMcVersion && metadata.mcVersionMax) {
            const target = this.parseVersion(targetMcVersion);
            const docMax = this.parseVersion(metadata.mcVersionMax);
            if (target && docMax) {
                // メジャーまたはマイナーバージョンが異なる場合
                if (target[0] > docMax[0] || (target[0] === docMax[0] && target[1] > docMax[1])) {
                    warnings.push(`⚠️ この情報はMC ${metadata.mcVersionMax}までの確認です。ターゲット${targetMcVersion}では仕様が変更されている可能性があります。`);
                }
            }
        }

        return warnings.length > 0 ? warnings.join('\n') : undefined;
    }

    private parseVersion(ver: string): [number, number, number] | null {
        const parts = ver.split('.').map(Number);
        if (parts.length >= 3 && parts.every((p) => !isNaN(p))) {
            return [parts[0], parts[1], parts[2]];
        }
        return null;
    }
}
