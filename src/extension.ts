// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getQuerySelectorResults } from './getQuerySelectorResults';
import {StructuralSearchPanel} from './panels/StructuralSearchPanel';
import { replaceInAllFiles } from './replaceInFiles';
import { convertToRegex } from './utilities/convertToRegexp';

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
			isRegex: true,
			matchWholeWord: true,
			replace: '',
		  }); 
	});

	let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceTagAll', (searchText, replaceText, choice) => {
		let processResult : string;
		let infoMessage : string;

		vscode.workspace.findFiles('**/*.{html}','**/node_modules/**').then(async files => {	
			const jsdom = require("jsdom");

			files.forEach( async file => {
				const rawContent = await vscode.workspace.fs.readFile(file);
    			const htmlText = new TextDecoder().decode(rawContent);
				
				const dom = new jsdom.JSDOM(htmlText);
				let {results,searchResult} = getQuerySelectorResults(dom, searchText);
				
				if (results !== null){
					processResult = replaceInAllFiles(results, choice, replaceText, file, dom);

					if (processResult === "WFerror"){
						infoMessage = "Replacement process could not performed successfully";
					}
					else if (processResult === "SAerror"){
						infoMessage = "Provided attribute format is not acceptable";
					}
					else if (processResult === "RAerror"){
						infoMessage = "Provide an attribute name to remove ";
					}
					else {
						infoMessage = `Replacement process for "${replaceText}" is successful`;
					}
				}
				else {
					infoMessage = searchResult;
				}
			});
			
			vscode.commands.executeCommand("search.action.clearSearchResults").then(()=>{
				vscode.commands.executeCommand("workbench.action.closeSidebar").then(() => {
					vscode.window.showInformationMessage(infoMessage);
				});
			});

		});
	});
		
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
