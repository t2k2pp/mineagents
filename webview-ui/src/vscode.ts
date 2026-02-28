// ============================================================
// VSCode API ブリッジ
// Webview から Extension Host への通信
// ============================================================

interface VsCodeApi {
    postMessage(message: unknown): void;
    getState(): unknown;
    setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

class VsCodeBridge {
    private api: VsCodeApi;

    constructor() {
        this.api = acquireVsCodeApi();
    }

    postMessage(message: unknown): void {
        this.api.postMessage(message);
    }

    getState<T>(): T | undefined {
        return this.api.getState() as T | undefined;
    }

    setState<T>(state: T): void {
        this.api.setState(state);
    }
}

export const vscode = new VsCodeBridge();
