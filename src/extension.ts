// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {StructuralSearchPanel} from './panels/StructuralSearchPanel';
import { convertToRegex } from './utilities/convertToRegexp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchTagAll = vscode.commands.registerCommand('tag-manager.searchTagAll', (searchText) => {
		let files : vscode.Uri [] = [];
		
		vscode.workspace.findFiles('**/*.{html,js}','**/node_modules/**').then(files => {
			files.forEach( async (file,index) => {
				files[index] = file;
			});

		});

		vscode.commands.executeCommand("workbench.action.findInFiles", {
			// Fill-in selected text to query
			query: convertToRegex(searchText),
			filesToInclude: files,
			triggerSearch: true,
			isRegex: true
		  }); 

	});

	let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceTagAll', (searchText,replaceText) => {
		let files : vscode.Uri [] = [];
		
		vscode.workspace.findFiles('**/*.{html,js}','**/node_modules/**').then(files => {
			let edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
			let position: vscode.Position = new vscode.Position(0,0);
			
			const jsdom = require("jsdom");
			files.forEach( async (file,index) => {
				const rawContent = await vscode.workspace.fs.readFile(file);
    			const htmlText = new TextDecoder().decode(rawContent);
				
				const dom = new jsdom.JSDOM(htmlText);
				
				if (dom !== null && dom.window !== null && dom.window.document !== null){
					const results: any[] | null = dom.window.document.querySelectorAll(searchText);
					
					if(results !== null){
						results.forEach ( async result => {
							console.log(result.textContent);
						});
					}
				} 
				files[index] = file;
			});
		});

	});

	const editor = vscode.window.activeTextEditor;
		
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

// this method is called when your extension is deactivated
export function deactivate() {}
