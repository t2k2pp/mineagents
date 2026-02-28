// ============================================================
// MineAgents - 実現可能性分析エンジン
// MC仕様に照らしてユーザー要望の実現可能性をチェック
// ============================================================

export interface FeasibilityCheckResult {
    possible: boolean;
    feasibleParts: string[];
    constrainedParts: Array<{
        description: string;
        constraint: string;
        alternatives: string[];
    }>;
    impossibleParts: Array<{
        description: string;
        reason: string;
        alternatives: string[];
    }>;
    complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * MC Bedrock Editionの仕様上の制約ルール
 */
const CONSTRAINT_RULES: Array<{
    pattern: RegExp;
    type: 'constraint' | 'impossible';
    message: string;
    alternatives: string[];
}> = [
        {
            pattern: /弾を撃つ|射撃|ビーム|レーザー/,
            type: 'constraint',
            message: 'アイテムから直接投射物を発射するにはScript APIが必要です',
            alternatives: ['パーティクル効果で視覚的に再現', 'Script API対応時に実装（将来対応）'],
        },
        {
            pattern: /テレポート|ワープ|瞬間移動/,
            type: 'constraint',
            message: 'テレポート効果にはScript APIまたはコマンドが必要です',
            alternatives: ['エンダーパールのような投射物を使用', 'Script API対応時に実装（将来対応）'],
        },
        {
            pattern: /空を飛ぶ|飛行|浮遊/,
            type: 'constraint',
            message: '自由飛行にはScript APIまたはエリトラ的メカニズムが必要です',
            alternatives: ['落下速度軽減の効果を付与', '高ジャンプ効果を付与'],
        },
        {
            pattern: /GUI|メニュー|UI/,
            type: 'constraint',
            message: 'カスタムGUIはScript APIが必要です',
            alternatives: ['NPC対話UIを活用', 'Script API対応時に実装（将来対応）'],
        },
        {
            pattern: /天候を変える|天気/,
            type: 'constraint',
            message: '天候変更にはコマンドまたはScript APIが必要です',
            alternatives: ['mcfunction経由でコマンド実行'],
        },
        {
            pattern: /新しいバイオーム|バイオーム追加/,
            type: 'impossible',
            message: '完全に新しいバイオームの追加はBedrock Editionの仕様上できません',
            alternatives: ['既存バイオームのカスタマイズ', 'カスタムブロックで環境を装飾'],
        },
        {
            pattern: /新しいディメンション|次元/,
            type: 'impossible',
            message: 'カスタムディメンションの追加はBedrock Editionの仕様上できません',
            alternatives: ['既存ディメンションをカスタマイズ', 'ワールド生成フィーチャーで独自地形を作成'],
        },
    ];

export class FeasibilityAnalyzer {
    /**
     * ユーザーの要望テキストに対して実現可能性をルールベースでチェック
     */
    analyzeFromText(userRequest: string): FeasibilityCheckResult {
        const result: FeasibilityCheckResult = {
            possible: true,
            feasibleParts: [],
            constrainedParts: [],
            impossibleParts: [],
            complexity: 'simple',
        };

        // ルールマッチング
        for (const rule of CONSTRAINT_RULES) {
            if (rule.pattern.test(userRequest)) {
                if (rule.type === 'impossible') {
                    result.impossibleParts.push({
                        description: userRequest,
                        reason: rule.message,
                        alternatives: rule.alternatives,
                    });
                    result.possible = false;
                } else {
                    result.constrainedParts.push({
                        description: userRequest,
                        constraint: rule.message,
                        alternatives: rule.alternatives,
                    });
                    result.complexity = 'complex';
                }
            }
        }

        // 複雑度の判定
        if (/エンティティ|モブ|mob|entity/i.test(userRequest)) {
            result.complexity = result.complexity === 'complex' ? 'complex' : 'moderate';
        }

        // 制約もなく実現可能なら記録
        if (result.constrainedParts.length === 0 && result.impossibleParts.length === 0) {
            result.feasibleParts.push('要望は全て実現可能です');
        }

        return result;
    }

    /**
     * 分析結果を人間向けテキストに変換
     */
    formatResult(result: FeasibilityCheckResult): string {
        const lines: string[] = ['分析結果をお伝えします。\n'];

        if (result.feasibleParts.length > 0) {
            lines.push('✅ **実現可能な部分:**');
            for (const part of result.feasibleParts) {
                lines.push(`  - ${part}`);
            }
            lines.push('');
        }

        if (result.constrainedParts.length > 0) {
            lines.push('⚠️ **制約がある部分:**');
            for (const part of result.constrainedParts) {
                lines.push(`  - ${part.constraint}`);
                for (const alt of part.alternatives) {
                    lines.push(`    → 代替案: ${alt}`);
                }
            }
            lines.push('');
        }

        if (result.impossibleParts.length > 0) {
            lines.push('❌ **実現不可能な部分:**');
            for (const part of result.impossibleParts) {
                lines.push(`  - ${part.reason}`);
                for (const alt of part.alternatives) {
                    lines.push(`    → 代替案: ${alt}`);
                }
            }
            lines.push('');
        }

        return lines.join('\n');
    }
}
