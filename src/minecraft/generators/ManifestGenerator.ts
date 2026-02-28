// ============================================================
// MineAgents - マニフェストジェネレーター
// Minecraft Bedrock リソースパック / ビヘイビアパック の manifest.json 生成
// ============================================================

import { generateUUID } from '../utils/uuid';

export interface ManifestOptions {
    name: string;
    description: string;
    namespace: string;
    version: [number, number, number];
    minEngineVersion: [number, number, number];
}

export interface ManifestPair {
    resourcePack: Record<string, unknown>;
    behaviorPack: Record<string, unknown>;
}

export class ManifestGenerator {
    /**
     * RP/BP ペアの manifest.json を生成
     */
    generatePair(options: ManifestOptions): ManifestPair {
        const rpUuid = generateUUID();
        const rpModuleUuid = generateUUID();
        const bpUuid = generateUUID();
        const bpModuleUuid = generateUUID();

        const resourcePack = {
            format_version: 2,
            header: {
                name: `${options.name} - Resource Pack`,
                description: options.description,
                uuid: rpUuid,
                version: options.version,
                min_engine_version: options.minEngineVersion,
            },
            modules: [
                {
                    type: 'resources',
                    uuid: rpModuleUuid,
                    version: options.version,
                },
            ],
        };

        const behaviorPack = {
            format_version: 2,
            header: {
                name: `${options.name} - Behavior Pack`,
                description: options.description,
                uuid: bpUuid,
                version: options.version,
                min_engine_version: options.minEngineVersion,
            },
            modules: [
                {
                    type: 'data',
                    uuid: bpModuleUuid,
                    version: options.version,
                },
            ],
            dependencies: [
                {
                    uuid: rpUuid,
                    version: options.version,
                },
            ],
        };

        return { resourcePack, behaviorPack };
    }

    /**
     * RPのみの manifest.json を生成
     */
    generateResourcePackOnly(options: ManifestOptions): Record<string, unknown> {
        return {
            format_version: 2,
            header: {
                name: options.name,
                description: options.description,
                uuid: generateUUID(),
                version: options.version,
                min_engine_version: options.minEngineVersion,
            },
            modules: [
                {
                    type: 'resources',
                    uuid: generateUUID(),
                    version: options.version,
                },
            ],
        };
    }

    /**
     * BPのみの manifest.json を生成
     */
    generateBehaviorPackOnly(options: ManifestOptions): Record<string, unknown> {
        return {
            format_version: 2,
            header: {
                name: options.name,
                description: options.description,
                uuid: generateUUID(),
                version: options.version,
                min_engine_version: options.minEngineVersion,
            },
            modules: [
                {
                    type: 'data',
                    uuid: generateUUID(),
                    version: options.version,
                },
            ],
        };
    }
}
