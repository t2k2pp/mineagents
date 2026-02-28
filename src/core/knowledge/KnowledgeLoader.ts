// ============================================================
// MineAgents - ナレッジローダー
// Frontmatter付きMarkdownドキュメントのロード・パース
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeMetadata {
    id: string;
    title: string;
    category: string;
    tags: string[];
    mcVersionMin: string;
    mcVersionMax: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    sourceVerifiedAt: string;
    freshnessDays: number;
}

export interface KnowledgeSection {
    heading: string;
    level: number;
    content: string;
}

export interface KnowledgeDocument {
    metadata: KnowledgeMetadata;
    rawContent: string;
    sections: KnowledgeSection[];
    filePath: string;
}

export class KnowledgeLoader {
    /**
     * 指定ディレクトリ内のMarkdownファイルを全て読み込む
     */
    loadAll(knowledgeDir: string): KnowledgeDocument[] {
        if (!fs.existsSync(knowledgeDir)) {
            return [];
        }

        const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith('.md'));
        const docs: KnowledgeDocument[] = [];

        for (const file of files) {
            const filePath = path.join(knowledgeDir, file);
            try {
                const doc = this.loadFile(filePath);
                if (doc) docs.push(doc);
            } catch (error) {
                console.error(`Failed to load knowledge file: ${file}`, error);
            }
        }

        return docs;
    }

    /**
     * 1ファイルをロードしてドキュメントオブジェクトに変換
     */
    loadFile(filePath: string): KnowledgeDocument | null {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = this.parseFrontmatter(raw);
        if (!parsed) return null;

        const sections = this.parseSections(parsed.body);

        return {
            metadata: parsed.metadata,
            rawContent: parsed.body,
            sections,
            filePath,
        };
    }

    /**
     * Frontmatter (---区切り) をパース
     */
    private parseFrontmatter(raw: string): { metadata: KnowledgeMetadata; body: string } | null {
        const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
        const match = raw.match(fmRegex);
        if (!match) return null;

        const fmBlock = match[1];
        const body = match[2];

        // 簡易YAMLパーサー（依存ライブラリなし）
        const fm: Record<string, string> = {};
        for (const line of fmBlock.split('\n')) {
            const colonIdx = line.indexOf(':');
            if (colonIdx < 0) continue;
            const key = line.substring(0, colonIdx).trim();
            let value = line.substring(colonIdx + 1).trim();
            // 引用符除去
            value = value.replace(/^["']|["']$/g, '');
            fm[key] = value;
        }

        // tags パース (YAML配列表記 [a, b, c])
        let tags: string[] = [];
        const tagsRaw = fm['tags'] ?? '';
        if (tagsRaw.startsWith('[')) {
            tags = tagsRaw.replace(/[\[\]]/g, '').split(',').map((t) => t.trim()).filter(Boolean);
        }

        const metadata: KnowledgeMetadata = {
            id: fm['id'] ?? path.basename('', '.md'),
            title: fm['title'] ?? '',
            category: fm['category'] ?? '',
            tags,
            mcVersionMin: fm['mc_version_min'] ?? '',
            mcVersionMax: fm['mc_version_max'] ?? '',
            createdAt: fm['created_at'] ?? '',
            updatedAt: fm['updated_at'] ?? '',
            source: fm['source'] ?? '',
            sourceVerifiedAt: fm['source_verified_at'] ?? '',
            freshnessDays: parseInt(fm['freshness_days'] ?? '180', 10),
        };

        return { metadata, body };
    }

    /**
     * Markdownをセクションに分割
     */
    private parseSections(body: string): KnowledgeSection[] {
        const sections: KnowledgeSection[] = [];
        const lines = body.split('\n');
        let currentHeading = '';
        let currentLevel = 0;
        let currentContent: string[] = [];

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
            if (headingMatch) {
                // 前のセクションを保存
                if (currentHeading || currentContent.length > 0) {
                    sections.push({
                        heading: currentHeading,
                        level: currentLevel,
                        content: currentContent.join('\n').trim(),
                    });
                }
                currentHeading = headingMatch[2];
                currentLevel = headingMatch[1].length;
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        // 最後のセクション
        if (currentHeading || currentContent.length > 0) {
            sections.push({
                heading: currentHeading,
                level: currentLevel,
                content: currentContent.join('\n').trim(),
            });
        }

        return sections;
    }
}
