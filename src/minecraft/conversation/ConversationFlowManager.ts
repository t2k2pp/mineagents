// ============================================================
// MineAgents - 対話フローマネージャー
// ヒアリング → 実現可能性分析 → 計画提示 → 承認 → 実装 のフロー管理
// ============================================================

export type ConversationPhase =
    | 'greeting'           // 初回挨拶・モード選択
    | 'hearing'            // ヒアリング（要件収集）
    | 'analyzing'          // 実現可能性分析
    | 'plan_presenting'    // 計画提示
    | 'plan_modifying'     // 計画修正
    | 'implementing'       // 段階実装
    | 'validating'         // 検証
    | 'packaging'          // パッケージ化
    | 'completed';         // 完了

export interface AddonRequirement {
    /** アドオンの種類 */
    type: 'item' | 'block' | 'entity' | 'recipe' | 'full_addon';
    /** アドオン名 */
    name?: string;
    /** 名前空間 */
    namespace?: string;
    /** 説明 */
    description?: string;
    /** 構造化された要件 */
    properties: Record<string, unknown>;
    /** ユーザーが未指定の項目に対するデフォルト提案 */
    suggestedDefaults: Record<string, unknown>;
}

export interface FeasibilityResult {
    /** 全体的に実現可能か */
    possible: boolean;
    /** 実現可能な部分 */
    feasibleParts: string[];
    /** 制約がある部分（代替案付き） */
    constrainedParts: Array<{
        description: string;
        constraint: string;
        alternatives: string[];
    }>;
    /** 実現不可能な部分（代替案付き） */
    impossibleParts: Array<{
        description: string;
        reason: string;
        alternatives: string[];
    }>;
    /** 複雑度 */
    complexity: 'simple' | 'moderate' | 'complex';
}

export interface AddonPlanStep {
    index: number;
    description: string;
    pack: 'resource' | 'behavior';
    fileType: 'manifest' | 'item' | 'block' | 'entity' | 'recipe' | 'texture' | 'model' | 'animation' | 'lang' | 'texture_map' | 'loot_table' | 'spawn_rule' | 'other';
    filePath: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AddonPlan {
    projectName: string;
    namespace: string;
    description: string;
    steps: AddonPlanStep[];
    estimatedTimeMinutes: number;
}

/**
 * 対話フローの状態を管理するマネージャー
 */
export class ConversationFlowManager {
    private phase: ConversationPhase = 'greeting';
    private requirements: AddonRequirement[] = [];
    private currentPlan: AddonPlan | null = null;
    private currentStepIndex = 0;

    /** 現在のフェーズを取得 */
    getPhase(): ConversationPhase {
        return this.phase;
    }

    /** フェーズを遷移 */
    setPhase(phase: ConversationPhase): void {
        this.phase = phase;
    }

    /** 要件を追加 */
    addRequirement(req: AddonRequirement): void {
        this.requirements.push(req);
    }

    /** 要件一覧を取得 */
    getRequirements(): AddonRequirement[] {
        return [...this.requirements];
    }

    /** 計画を設定 */
    setPlan(plan: AddonPlan): void {
        this.currentPlan = plan;
        this.currentStepIndex = 0;
    }

    /** 計画を取得 */
    getPlan(): AddonPlan | null {
        return this.currentPlan;
    }

    /** 次の実装ステップに進む */
    advanceStep(): AddonPlanStep | null {
        if (!this.currentPlan) return null;
        if (this.currentStepIndex >= this.currentPlan.steps.length) return null;

        const step = this.currentPlan.steps[this.currentStepIndex];
        step.status = 'in_progress';
        this.currentStepIndex++;
        return step;
    }

    /** 現在のステップを完了 */
    completeCurrentStep(): void {
        if (!this.currentPlan || this.currentStepIndex === 0) return;
        this.currentPlan.steps[this.currentStepIndex - 1].status = 'completed';
    }

    /** 実装が全ステップ完了したか */
    isAllStepsCompleted(): boolean {
        if (!this.currentPlan) return false;
        return this.currentPlan.steps.every((s) => s.status === 'completed');
    }

    /** 進捗率を取得 */
    getProgress(): { completed: number; total: number } {
        if (!this.currentPlan) return { completed: 0, total: 0 };
        const completed = this.currentPlan.steps.filter((s) => s.status === 'completed').length;
        return { completed, total: this.currentPlan.steps.length };
    }

    /** フローをリセット */
    reset(): void {
        this.phase = 'greeting';
        this.requirements = [];
        this.currentPlan = null;
        this.currentStepIndex = 0;
    }

    /**
     * 現在のフェーズに対するガイドメッセージを生成する
     * （LLMに付加情報として渡す目的）
     */
    getPhaseGuidance(): string {
        switch (this.phase) {
            case 'greeting':
                return '最初にユーザーに挨拶し、何を作りたいか聞いてください。インタラクションモードの選択も促してください。';
            case 'hearing':
                return 'ユーザーの要望を正確に把握してください。不明点があれば質問し、構造化された要件にまとめてください。';
            case 'analyzing':
                return '要件をMinecraft Bedrock Editionの仕様に照らし合わせ、実現可能性を分析してください。制約がある場合は代替案を提示してください。';
            case 'plan_presenting':
                return '具体的なファイル生成計画を提示し、ユーザーの承認を得てください。各ファイルの内容と目的を簡潔に説明してください。';
            case 'plan_modifying':
                return 'ユーザーの修正要求に基づいて計画を更新し、再提示してください。';
            case 'implementing':
                return '承認された計画に従い、各ファイルを順次生成してください。進捗を逐次報告してください。';
            case 'validating':
                return '生成したアドオンの整合性を検証してください。エラーがあれば修正してください。';
            case 'packaging':
                return 'アドオンをパッケージ化し、ユーザーにデプロイ方法を案内してください。';
            case 'completed':
                return 'タスクが完了しました。次のリクエストを待ちます。';
            default:
                return '';
        }
    }
}
