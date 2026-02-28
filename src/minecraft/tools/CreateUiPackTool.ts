// ============================================================
// MineAgents - create_ui_pack ツール
// UI改変リソースパックを作成
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolContext, ToolResult } from '../../core/tools/types';
import { ManifestGenerator } from '../generators/ManifestGenerator';

export class CreateUiPackTool implements Tool {
    readonly name = 'create_ui_pack';
    readonly description = 'UI改変リソースパック（交易画面、インベントリ、HUD等の改変）を作成します。JSONUIシステムを使用してバニラUIをオーバーライドします。';
    readonly requiresApproval = true;
    readonly parameterSchema = {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'パック名（例: Trading Helper）' },
            namespace: { type: 'string', description: '名前空間（例: trading_helper）' },
            description: { type: 'string', description: 'パックの説明' },
            targetScreen: {
                type: 'string',
                enum: ['trade2_screen', 'inventory_screen', 'hud_screen', 'chest_screen', 'crafting_screen', 'custom'],
                description: '改変対象の画面',
            },
            uiJsonContent: { type: 'string', description: 'UI定義JSONの内容（カスタム画面用）' },
        },
        required: ['name', 'namespace', 'description', 'targetScreen'],
    };

    private manifestGen = new ManifestGenerator();

    async execute(params: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
        const name = params.name as string;
        const namespace = params.namespace as string;
        const description = params.description as string;
        const targetScreen = params.targetScreen as string;
        const uiJsonContent = params.uiJsonContent as string | undefined;

        const projectDir = path.join(context.workspaceRoot, namespace);

        try {
            // ディレクトリ構造を作成
            fs.mkdirSync(path.join(projectDir, 'ui'), { recursive: true });
            fs.mkdirSync(path.join(projectDir, 'textures', 'ui'), { recursive: true });

            // manifest.json 生成（RPのみ）
            const manifest = this.manifestGen.generateResourcePackOnly({
                name,
                namespace,
                description,
                version: [1, 0, 0],
                minEngineVersion: [1, 21, 0],
            });
            fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifest, null, 4));

            // UI定義ファイルを作成
            const screenFile = targetScreen === 'custom' ? 'custom_screen' : targetScreen;
            const uiFilePath = path.join(projectDir, 'ui', `${screenFile}.json`);

            if (uiJsonContent) {
                // ユーザー指定のJSON内容
                fs.writeFileSync(uiFilePath, uiJsonContent);
            } else {
                // テンプレートを生成
                const template = this.generateScreenTemplate(namespace, targetScreen);
                fs.writeFileSync(uiFilePath, JSON.stringify(template, null, 4));
            }

            // _ui_defs.json を作成（追加ファイル用）
            // 注: バニラと同名のファイルは自動マージされるため、
            //      カスタムファイルのみ登録が必要
            if (targetScreen === 'custom') {
                const uiDefs = { ui_defs: [`ui/${screenFile}.json`] };
                fs.writeFileSync(path.join(projectDir, 'ui', '_ui_defs.json'), JSON.stringify(uiDefs, null, 4));
            }

            const createdFiles = [
                `manifest.json`,
                `ui/${screenFile}.json`,
            ];
            if (targetScreen === 'custom') {
                createdFiles.push('ui/_ui_defs.json');
            }

            return {
                success: true,
                output: `UI改変パック「${name}」を作成しました:\n${createdFiles.map((f) => `  📄 ${namespace}/${f}`).join('\n')}\n\n対象画面: ${targetScreen}\nwrite_file ツールで ui/${screenFile}.json を編集してUI改変を追加できます。`,
                metadata: { projectDir, namespace, targetScreen, files: createdFiles },
            };
        } catch (error) {
            return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    private generateScreenTemplate(namespace: string, targetScreen: string): Record<string, unknown> {
        switch (targetScreen) {
            case 'trade2_screen':
                return this.tradingHelperTemplate(namespace);
            case 'hud_screen':
                return this.hudTemplate(namespace);
            default:
                return this.genericTemplate(namespace, targetScreen);
        }
    }

    /**
     * Trading Helper型テンプレート
     * ロック交易を見えるようにし、アイテム名とエンチャント情報を表示
     */
    private tradingHelperTemplate(namespace: string): Record<string, unknown> {
        return {
            namespace: 'trade2',

            // ロック交易のオーバーレイを非表示にする
            'locked_trade_overlay': {
                'type': 'panel',
                'visible': false,
            },

            // ロックされた交易アイテムの表示設定
            'locked_trade_button': {
                'alpha': 0.5,
            },

            // アイテム名を常に表示するラベル
            [`${namespace}_trade_item_name`]: {
                'type': 'label',
                'text': '#trade_item_name',
                'shadow': true,
                'font_size': 'small',
                'color': [0.8, 0.8, 0.8, 1.0],
                'bindings': [
                    {
                        'binding_name': '#trade_item_name',
                        'binding_type': 'collection',
                        'binding_collection_name': 'trade_items',
                    },
                ],
            },
        };
    }

    private hudTemplate(namespace: string): Record<string, unknown> {
        return {
            namespace: 'hud',
            [`${namespace}_custom_panel`]: {
                'type': 'panel',
                'size': ['100%', '100%'],
                'controls': [],
            },
        };
    }

    private genericTemplate(namespace: string, screen: string): Record<string, unknown> {
        return {
            namespace: screen.replace('_screen', ''),
            [`${namespace}_modifications`]: {
                'type': 'panel',
                'controls': [],
            },
        };
    }
}
