// ============================================================
// MineAgents - ツールレジストリ
// 全ツールの登録・管理・LLM用スキーマ生成
// ============================================================

import { Tool, ToolSchema } from './types';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    /** ツールを登録 */
    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool already registered: ${tool.name}`);
        }
        this.tools.set(tool.name, tool);
    }

    /** ツールを取得 */
    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /** 全ツール一覧を取得 */
    getAll(): Tool[] {
        return Array.from(this.tools.values());
    }

    /** LLMに渡すツールスキーマ一覧を生成 */
    getToolSchemas(): ToolSchema[] {
        return this.getAll().map((tool) => ({
            type: 'function' as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameterSchema,
            },
        }));
    }

    /** 承認が必要なツールかチェック */
    requiresApproval(toolName: string): boolean {
        const tool = this.tools.get(toolName);
        return tool?.requiresApproval ?? true;
    }

    /** 登録済みツール数 */
    get size(): number {
        return this.tools.size;
    }

    /** ツールの説明一覧（ケイパビリティ説明用） */
    getToolDescriptions(): Array<{ name: string; description: string }> {
        return this.getAll().map((t) => ({
            name: t.name,
            description: t.description,
        }));
    }
}
