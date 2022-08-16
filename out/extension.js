"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const StructuralSearchPanel_1 = require("./panels/StructuralSearchPanel");
const convertToRegexp_1 = require("./utilities/convertToRegexp");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
        StructuralSearchPanel_1.StructuralSearchPanel.render(context.extensionUri);
    });
    let disposableSearchTagAll = vscode.commands.registerCommand('tag-manager.searchTagAll', (searchText) => {
        let files = [];
        vscode.workspace.findFiles('**/*.{html,js}', '**/node_modules/**').then(files => {
            files.forEach(async (file, index) => {
                files[index] = file;
            });
        });
        vscode.commands.executeCommand("workbench.action.findInFiles", {
            // Fill-in selected text to query
            query: (0, convertToRegexp_1.convertToRegex)(searchText),
            filesToInclude: files,
            triggerSearch: true,
            isRegex: true,
            matchWholeWord: true
        });
    });
    let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceTagAll', (searchText, replaceText) => {
        vscode.workspace.findFiles('**/*.{html}', '**/node_modules/**').then(files => {
            const jsdom = require("jsdom");
            files.forEach(async (file) => {
                const rawContent = await vscode.workspace.fs.readFile(file);
                const htmlText = new TextDecoder().decode(rawContent);
                const dom = new jsdom.JSDOM(htmlText);
                let results = dom.window.document.querySelectorAll(searchText);
                results?.forEach(result => {
                    result.className = replaceText;
                });
                vscode.workspace.fs.writeFile(file, new TextEncoder().encode(dom.serialize()));
            });
        });
        vscode.commands.executeCommand("search.action.refreshSearchResults");
    });
    //const editor = vscode.window.activeTextEditor;
    /* let disposableSearchTag = vscode.commands.registerCommand('tag-manager.searchTag', async (searchText) => {
        if (editor === undefined || editor.document === undefined){
            return ;
        }

        const text = editor.document.getText().trim();

        searchText = await vscode.window.showInputBox();

        
        //tag ? editor.selections = findTag(tag, text, editor) : null;
    }); */
    context.subscriptions.push(disposableSearchPanel);
    context.subscriptions.push(disposableSearchTagAll);
    context.subscriptions.push(disposableReplaceTagAll);
    //context.subscriptions.push(disposableSearchTag);
    /*	let disposableChangeAttribute = vscode.commands.registerCommand('tag-manager.changeAttribute', async () => {
            if (editor === undefined || editor.document === undefined){
                return ;
            }
    
            const attributeValue = await (vscode.window.showInputBox());
            const text = editor.document.getText().trim();
    
            attributeValue ? editor.selections = findAttribute(attributeValue, text, editor) : null;
        });
    
        let disposableWrapTag = vscode.commands.registerCommand('tag-manager.wrapTag', async () => {
            if (editor === undefined || editor.document === undefined){
                return ;
            }
    
            let upperTag = await (vscode.window.showInputBox());
    
            wrapTag(editor,editor.document,upperTag);
        });
    
        let disposableRemoveUpperTag = vscode.commands.registerCommand('tag-manager.removeTag', async () => {
            if (editor === undefined || editor.document === undefined){
                return ;
            }
    
            removeUpperTag(editor, editor.document);
        }); */
    //context.subscriptions.push(disposableChangeAttribute);
    //context.subscriptions.push(disposableWrapTag);
    //context.subscriptions.push(disposableRemoveUpperTag);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map