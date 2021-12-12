"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const util = require("util");
const inspector = require("inspector");
const addDecorationWithText = (contentText, line, column, activeEditor) => {
    const decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText,
            margin: "20px"
        }
    });
    const range = new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, column));
    activeEditor.setDecorations(decorationType, [{ range }]);
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context) {
    const session = new inspector.Session();
    session.connect();
    const post = util.promisify(session.post).bind(session);
    await post("Debugger.enable");
    await post("Runtime.enable");
    let disposable = vscode.commands.registerCommand('quokka.quokka', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        const document = activeEditor.document;
        const filename = path.basename(document.uri.toString());
        const { scriptId } = await post("Runtime.compileScript", {
            expression: document.getText(),
            sourceURL: filename,
            persistScript: true
        });
        await post('Runtime.runScript', { scriptId });
        const data = await post('Runtime.globalLexicalScopeNames', { executionContextId: 1 });
        data.names.map(async (expression) => {
            const executionResult = await post('Runtime.evaluate', { expression, contextId: 1 });
            const { value } = executionResult.result;
            const { result } = await post('Debugger.searchInContent', {
                scriptId, query: expression
            });
            addDecorationWithText(`${value}`, result[0].lineNumber, result[0].lineContent.length, activeEditor);
        });
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Done!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map