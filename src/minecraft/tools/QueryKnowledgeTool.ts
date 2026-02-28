// ============================================================
// MineAgents - query_knowledge ツール
// エージェントがナレッジベースを検索するためのツール
// ============================================================

import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { KnowledgeEngine } from '../../core/knowledge/KnowledgeEngine';

export class QueryKnowledgeTool implements Tool {
    readonly name = 'query_knowledge';
    readonly description = 'Minecraft Bedrock Editionのアドオン仕様に関するナレッジを検索します。コンポーネント、format_version、制約、バニラID等を調べる際に使用してください。推測せず、必ずこのツールで確認してください。';
    readonly requiresApproval = false;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            query: { type: 'string', description: '検索クエリ（例: "minecraft:damage アイテム", "ブロック 発光", "レシピ shaped"）' },
            category: { type: 'string', description: 'カテゴリフィルタ（component, structure, reference, constraint）' },
            docId: { type: 'string', description: '特定ドキュメントを直接参照する場合のID（例: "items", "blocks"）' },
        },
        required: ['query'],
    };

    constructor(private engine: KnowledgeEngine) { }

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const query = params.query as string;
        const category = params.category as string | undefined;
        const docId = params.docId as string | undefined;

        // 特定ドキュメント直接参照
        if (docId) {
            const doc = this.engine.getDocument(docId);
            if (doc) {
                let output = `## 📖 ${doc.metadata.title}\n`;
                output += `MC対応: ${doc.metadata.mcVersionMin}〜${doc.metadata.mcVersionMax}\n`;
                output += `情報源: ${doc.metadata.source || '内部'}\n`;
                output += `最終確認: ${doc.metadata.sourceVerifiedAt || doc.metadata.updatedAt}\n\n`;
                output += doc.rawContent;
                return { success: true, output };
            }
            return { success: false, output: `ドキュメント "${docId}" が見つかりません。` };
        }

        // キーワード検索
        const results = this.engine.search(query, {
            category,
            maxResults: 3,
        });

        const output = this.engine.formatSearchResults(results);
        return {
            success: true,
            output,
            metadata: { resultCount: results.length, query },
        };
    }
}
