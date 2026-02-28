// ============================================================
// MineAgents - Mcaddon/McpackビルダーMcaddon/Mcpackビルダー
// .mcpack / .mcaddon アーカイブのビルド
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

export class McpackBuilder {
    /**
     * ディレクトリを .mcpack (ZIP) にパッケージ化
     */
    async buildMcpack(sourceDir: string, outputPath: string): Promise<string> {
        return this.createZipArchive(sourceDir, outputPath);
    }

    /**
     * RP/BPの両方を含む .mcaddon (ZIP) にパッケージ化
     */
    async buildMcaddon(rpDir: string, bpDir: string, outputPath: string): Promise<string> {
        const tempDir = path.join(path.dirname(outputPath), '.mcaddon_temp');
        fs.mkdirSync(tempDir, { recursive: true });

        try {
            // 個別の .mcpack を作成
            const rpPack = path.join(tempDir, 'rp.mcpack');
            const bpPack = path.join(tempDir, 'bp.mcpack');

            await this.buildMcpack(rpDir, rpPack);
            await this.buildMcpack(bpDir, bpPack);

            // .mcaddon として束ねる
            return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(outputPath);
                const archive = archiver.default('zip', { zlib: { level: 9 } });

                output.on('close', () => resolve(outputPath));
                archive.on('error', reject);
                archive.pipe(output);

                archive.file(rpPack, { name: path.basename(rpPack) });
                archive.file(bpPack, { name: path.basename(bpPack) });

                archive.finalize();
            });
        } finally {
            // 一時ファイルのクリーンアップ
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }

    private createZipArchive(sourceDir: string, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver.default('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve(outputPath));
            archive.on('error', reject);
            archive.pipe(output);

            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
}
