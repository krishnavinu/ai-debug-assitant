import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Debug Assistant is now active!');

    let disposable = vscode.commands.registerCommand('ai-debug-assistant.debugCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const code = editor.document.getText();
        vscode.window.showInformationMessage('Analyzing code with AI...');

        try {
            const debugResult = await analyzeCodeWithAI(code);
            showDebugResult(debugResult);
        } catch (error) {
            vscode.window.showErrorMessage('Error analyzing code.');
        }
    });

    context.subscriptions.push(disposable);
}

async function analyzeCodeWithAI(code: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        vscode.window.showErrorMessage('API Key is missing. Check your .env file.');
        throw new Error('API Key is missing.');
    }

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: `Analyze this code and give the corrected code:\n\n${code}` }]
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.choices[0].message.content.trim();
}

function showDebugResult(result: string) {
    const panel = vscode.window.createWebviewPanel(
        'aiDebugResult',
        'AI Debugging Result',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    panel.webview.html = `
        <html>
        <body>
            <h2>AI Debugging Result</h2>
            <pre>${result}</pre>
        </body>
        </html>
    `;
}

export function deactivate() {
    console.log('AI Debug Assistant is now deactivated.');
}
