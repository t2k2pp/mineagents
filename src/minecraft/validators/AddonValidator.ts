// ============================================================
// MineAgents - アドオンバリデーター
// 生成されたアドオンの整合性を検証
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
    valid: boolean;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
}

export interface ValidationIssue {
    severity: 'error' | 'warning';
    file: string;
    message: string;
    line?: number;
}

export class AddonValidator {
    /**
     * アドオンプロジェクトを検証
     */
    validate(projectPath: string, namespace: string): ValidationResult {
        const errors: ValidationIssue[] = [];
        const warnings: ValidationIssue[] = [];

        const rpDir = path.join(projectPath, `${namespace}_RP`);
        const bpDir = path.join(projectPath, `${namespace}_BP`);

        // RP検証
        if (fs.existsSync(rpDir)) {
            this.validateManifest(rpDir, 'RP', errors, warnings);
            this.validateTextureReferences(rpDir, bpDir, errors, warnings);
            this.validateLangFile(rpDir, errors, warnings);
        }

        // BP検証
        if (fs.existsSync(bpDir)) {
            this.validateManifest(bpDir, 'BP', errors, warnings);
            this.validateJsonFiles(bpDir, errors, warnings);
            this.validateIdentifiers(bpDir, namespace, errors, warnings);
        }

        // 相互依存チェック
        if (fs.existsSync(rpDir) && fs.existsSync(bpDir)) {
            this.validateCrossDependencies(rpDir, bpDir, errors, warnings);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * 検証結果を人間向けテキストに変換
     */
    formatResult(result: ValidationResult): string {
        const lines: string[] = [];

        if (result.valid) {
            lines.push('✅ 検証結果: OK（エラーなし）');
        } else {
            lines.push('❌ 検証結果: エラーあり');
        }

        if (result.errors.length > 0) {
            lines.push('\n**エラー:**');
            for (const e of result.errors) {
                lines.push(`  ❌ [${e.file}] ${e.message}`);
            }
        }

        if (result.warnings.length > 0) {
            lines.push('\n**警告:**');
            for (const w of result.warnings) {
                lines.push(`  ⚠️ [${w.file}] ${w.message}`);
            }
        }

        return lines.join('\n');
    }

    // ============================================================
    // 個別検証メソッド
    // ============================================================

    private validateManifest(packDir: string, packType: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        const manifestPath = path.join(packDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: 'manifest.json が見つかりません' });
            return;
        }

        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            // format_version チェック
            if (manifest.format_version !== 2) {
                errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: `format_version は 2 である必要があります（現在: ${manifest.format_version}）` });
            }

            // header チェック
            if (!manifest.header?.uuid) {
                errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: 'header.uuid が未設定です' });
            }
            if (!manifest.header?.name) {
                warnings.push({ severity: 'warning', file: `${packType}/manifest.json`, message: 'header.name が未設定です' });
            }
            if (!manifest.header?.version) {
                errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: 'header.version が未設定です' });
            }

            // modules チェック
            if (!manifest.modules || manifest.modules.length === 0) {
                errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: 'modules が空です' });
            }
        } catch (error) {
            errors.push({ severity: 'error', file: `${packType}/manifest.json`, message: `JSONパースエラー: ${error instanceof Error ? error.message : String(error)}` });
        }
    }

    private validateJsonFiles(bpDir: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        const jsonDirs = ['items', 'blocks', 'entities', 'recipes'];
        for (const dir of jsonDirs) {
            const fullDir = path.join(bpDir, dir);
            if (!fs.existsSync(fullDir)) continue;

            const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(fullDir, file);
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                    // format_version チェック
                    if (!content.format_version) {
                        errors.push({ severity: 'error', file: `BP/${dir}/${file}`, message: 'format_version が未設定です' });
                    }
                } catch (error) {
                    errors.push({ severity: 'error', file: `BP/${dir}/${file}`, message: `JSONパースエラー: ${error instanceof Error ? error.message : String(error)}` });
                }
            }
        }
    }

    private validateIdentifiers(bpDir: string, namespace: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        const jsonDirs = ['items', 'blocks', 'entities'];
        for (const dir of jsonDirs) {
            const fullDir = path.join(bpDir, dir);
            if (!fs.existsSync(fullDir)) continue;

            const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const content = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf-8'));
                    const key = dir === 'items' ? 'minecraft:item' : dir === 'blocks' ? 'minecraft:block' : 'minecraft:entity';
                    const identifier = content[key]?.description?.identifier;

                    if (identifier && !identifier.startsWith(`${namespace}:`)) {
                        warnings.push({ severity: 'warning', file: `BP/${dir}/${file}`, message: `識別子 "${identifier}" が名前空間 "${namespace}" で始まっていません` });
                    }
                } catch {
                    // JSONパースエラーは別の検証で検出済み
                }
            }
        }
    }

    private validateTextureReferences(rpDir: string, bpDir: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        // item_texture.json のテクスチャパス存在確認
        const itemTexPath = path.join(rpDir, 'textures', 'item_texture.json');
        if (fs.existsSync(itemTexPath)) {
            try {
                const itemTex = JSON.parse(fs.readFileSync(itemTexPath, 'utf-8'));
                for (const [key, value] of Object.entries(itemTex.texture_data ?? {})) {
                    const texPath = (value as { textures: string }).textures;
                    const fullTexPath = path.join(rpDir, `${texPath}.png`);
                    if (!fs.existsSync(fullTexPath)) {
                        warnings.push({ severity: 'warning', file: 'RP/textures/item_texture.json', message: `テクスチャ "${texPath}.png" が見つかりません（${key}）` });
                    }
                }
            } catch {
                // パースエラーは別途
            }
        }
    }

    private validateLangFile(rpDir: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        const langDir = path.join(rpDir, 'texts');
        if (!fs.existsSync(langDir)) {
            warnings.push({ severity: 'warning', file: 'RP/texts/', message: '言語ファイルディレクトリが見つかりません' });
        }
    }

    private validateCrossDependencies(rpDir: string, bpDir: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
        try {
            const bpManifest = JSON.parse(fs.readFileSync(path.join(bpDir, 'manifest.json'), 'utf-8'));
            const rpManifest = JSON.parse(fs.readFileSync(path.join(rpDir, 'manifest.json'), 'utf-8'));

            // BPがRPに依存しているかチェック
            const rpUuid = rpManifest.header?.uuid;
            const hasDep = bpManifest.dependencies?.some((d: { uuid: string }) => d.uuid === rpUuid);
            if (!hasDep) {
                warnings.push({ severity: 'warning', file: 'BP/manifest.json', message: 'BPからRPへの依存関係が設定されていません' });
            }
        } catch {
            // manifest読み込み失敗は別途検出済み
        }
    }
}
