// ============================================================
// MineAgents - ツールシステム 型定義・インターフェース  
// エージェントが使用するツールの共通インターフェース
// ============================================================

/** ツールハンドラのインターフェース */
export interface Tool {
    /** ツール名（一意識別子） */
    readonly name: string;

    /** ツールの説明（LLMに渡される） */
    readonly description: string;

    /** パラメータのJSONスキーマ */
    readonly parameterSchema: Record<string, unknown>;

    /** ユーザー承認が必要か */
    readonly requiresApproval: boolean;

    /** ツールを実行 */
    execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult>;
}

/** ツール実行時のコンテキスト */
export interface ToolContext {
    /** ワークスペースのルートパス */
    workspaceRoot: string;

    /** 現在のアドオンプロジェクトパス（あれば） */
    addonProjectPath?: string;

    /** ユーザーへの質問用コールバック */
    askUser(question: string): Promise<string>;

    /** 進捗報告用コールバック */
    reportProgress(step: number, total: number, description: string): void;

    /** ユーザー承認取得用コールバック */
    requestApproval(description: string, details: string, diff?: string): Promise<boolean>;
}

/** ツール実行結果 */
export interface ToolResult {
    success: boolean;
    output: string;
    metadata?: Record<string, unknown>;
}

/** ツール定義（LLMに渡すスキーマ形式） */
export interface ToolSchema {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

/** ツールの実行状態 */
export type ToolExecutionStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
