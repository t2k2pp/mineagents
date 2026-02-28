// ============================================================
// MineAgents - ケイパビリティマップ
// エージェントが「何ができるか」をユーザーに説明するための定義
// ============================================================

export interface Capability {
    id: string;
    name: string;
    icon: string;
    description: string;
    examples: string[];
    limitations: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    requiredPacks: ('resource' | 'behavior')[];
}

/**
 * MineAgents で作成可能なアドオン要素の一覧
 */
export const CAPABILITY_MAP: Capability[] = [
    {
        id: 'custom_item',
        name: 'カスタムアイテム',
        icon: '🗡️',
        description: '武器、防具、道具、食料などのカスタムアイテムを追加します。攻撃力・耐久値・エンチャント効果も設定可能です。',
        examples: [
            'ルビーの剣（攻撃力12、炎属性）',
            'エメラルドの防具セット',
            '回復効果付きカスタム食料',
            '特殊ツール（幸運エンチャント付きツルハシ）',
        ],
        limitations: [
            '3Dモデルアイテムの形状にはMinecraftの制限があります',
            '完全にカスタムなアイテム使用アニメーションは追加できません',
        ],
        complexity: 'simple',
        requiredPacks: ['resource', 'behavior'],
    },
    {
        id: 'custom_block',
        name: 'カスタムブロック',
        icon: '🧱',
        description: '装飾用ブロック、光源、機能ブロックなどを追加します。形状やテクスチャのカスタマイズが可能です。',
        examples: [
            '光る水晶ブロック',
            'カラフルなレンガブロック',
            'カスタム階段・ハーフブロック',
            '装飾用の柱や彫刻ブロック',
        ],
        limitations: [
            'ブロック形状はMinecraftで用意されたバリエーション内での選択になります',
            'カスタムブロックの最大数はワールドあたり制限があります',
        ],
        complexity: 'moderate',
        requiredPacks: ['resource', 'behavior'],
    },
    {
        id: 'custom_entity',
        name: 'カスタムエンティティ（モブ）',
        icon: '🐾',
        description: '新しいモブ、NPC、ボスなどを追加します。AI行動、ドロップアイテム、スポーン条件も設定可能です。',
        examples: [
            'ペットにできるカスタム犬種',
            'ダンジョンのボスモンスター',
            '村人の新しい職業',
            '友好的なNPC',
        ],
        limitations: [
            'AI行動は既存のコンポーネントの組み合わせで実現します',
            '完全に新しいAIロジックにはScript APIが必要です（将来対応）',
        ],
        complexity: 'complex',
        requiredPacks: ['resource', 'behavior'],
    },
    {
        id: 'recipe',
        name: 'クラフトレシピ',
        icon: '🔧',
        description: 'カスタムアイテムのクラフト方法を定義します。作業台レシピ、かまどレシピなどに対応。',
        examples: [
            'ルビーの剣のクラフトレシピ（ルビー×2 + ブレイズロッド）',
            '新しいかまどレシピ',
            '不定形レシピ（並び順自由）',
        ],
        limitations: [
            'レシピUIの見た目はMinecraft標準のままです',
        ],
        complexity: 'simple',
        requiredPacks: ['behavior'],
    },
    {
        id: 'texture',
        name: 'テクスチャ生成',
        icon: '🎨',
        description: 'AIが自動でMinecraft風のドット絵テクスチャを生成します。ブロック、アイテム、エンティティに対応。',
        examples: [
            'ドット絵風の剣テクスチャ',
            'リアルな鉱石ブロックテクスチャ',
            'カスタムモブのスキン',
        ],
        limitations: [
            'エンティティのUVマッピング対応テクスチャは複雑なため品質にばらつきがあります',
            'Stable Diffusionサーバーへの接続が必要です',
        ],
        complexity: 'moderate',
        requiredPacks: ['resource'],
    },
    {
        id: 'full_addon',
        name: 'フルアドオンパッケージ',
        icon: '📦',
        description: '複数のアイテム・ブロック・モブを含む完全なアドオンを作成し、.mcaddon形式でエクスポートします。',
        examples: [
            'ルビーセット（剣・防具・鉱石・レシピ全部入り）',
            '新しいバイオームのモブ+ブロックセット',
            'RPGスタイルの武器・防具コレクション',
        ],
        limitations: [
            'アドオン全体の複雑さによっては複数回のやり取りが必要です',
        ],
        complexity: 'complex',
        requiredPacks: ['resource', 'behavior'],
    },
];

/**
 * ケイパビリティマップを人間向けのテキストに変換
 */
export function formatCapabilityOverview(): string {
    const lines = ['MineAgentsで作成できるアドオンの種類をご紹介します！\n'];

    for (const cap of CAPABILITY_MAP) {
        const complexity =
            cap.complexity === 'simple' ? '★簡単' :
                cap.complexity === 'moderate' ? '★★普通' : '★★★やや複雑';

        lines.push(`${cap.icon} **${cap.name}**（${complexity}）`);
        lines.push(`  ${cap.description}`);
        lines.push(`  例: ${cap.examples.slice(0, 2).join('、')}`);
        lines.push('');
    }

    lines.push('何を作りたいですか？具体的なイメージがなくても、');
    lines.push('「かっこいい武器が欲しい」のような曖昧な希望でも大丈夫です！');

    return lines.join('\n');
}
