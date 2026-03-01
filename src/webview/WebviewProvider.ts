// ============================================================
// MineAgents - WebviewProvider
// VSCode Webview パネルの管理
// ============================================================

import * as vscode from 'vscode';

export class WebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'mineagents.chatView';

    private view?: vscode.WebviewView;
    private messageHandler?: (message: unknown) => void;

    constructor(private readonly extensionUri: vscode.Uri) { }

    /** メッセージハンドラを設定 */
    onMessage(handler: (message: unknown) => void): void {
        this.messageHandler = handler;
    }

    /** Webviewにメッセージを送信 */
    postMessage(message: unknown): void {
        this.view?.webview.postMessage(message);
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'dist'),
                vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist'),
                vscode.Uri.joinPath(this.extensionUri, 'node_modules', '@vscode', 'codicons', 'dist'),
            ],
        };

        webviewView.webview.html = this.getHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((message) => {
            this.messageHandler?.(message);
        });
    }

    private getHtml(webview: vscode.Webview): string {
        // Webview UI のビルド出力パスを参照
        const webviewDistPath = vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist');

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(webviewDistPath, 'assets', 'index.js'),
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(webviewDistPath, 'assets', 'index.css'),
        );

        // VS Code Codicons (vscodellm と同じ方法)
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                'node_modules',
                '@vscode',
                'codicons',
                'dist',
                'codicon.css',
            ),
        );

        const nonce = getNonce();
        const cspSource = webview.cspSource;

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
                   style-src ${cspSource} 'unsafe-inline';
                   font-src ${cspSource};
                   script-src 'nonce-${nonce}';
                   img-src ${cspSource} data:;">
    <link rel="stylesheet" href="${styleUri}">
    <link rel="stylesheet" href="${codiconsUri}">
    <title>MineAgents</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

