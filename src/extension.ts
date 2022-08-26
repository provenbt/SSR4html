// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getQuerySelectorResults } from './getQuerySelectorResults';
import {StructuralSearchPanel} from './panels/StructuralSearchPanel';
import { replaceInFile } from './replaceInFile';
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

	const rawContents : Uint8Array[] = [];
	const fileList: vscode.Uri[] = [];

	let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceTagAll', (searchText, replaceText, choice) => {
		let processResult: string;
		let searchMessage : string;

		vscode.workspace.findFiles('**/*.{html}','**/node_modules/**').then(async files => {	
			const jsdom = require("jsdom");
			
			files.forEach( async file => {
				const rawContent = await vscode.workspace.fs.readFile(file);
    			const htmlText = new TextDecoder().decode(rawContent);
				
				const dom = new jsdom.JSDOM(htmlText);
				const {results, searchResult} = getQuerySelectorResults(dom, searchText);
				
				if (results !== null && results.length > 0){
					processResult = replaceInFile(results, choice, replaceText, file, dom);

					if (processResult !== "Success"){
						throw new Error("Replacement Error");
					}
					
					rawContents.push(rawContent);
					fileList.push(file);
				}
				else {
					searchMessage = searchResult;
				}
			});
			
			vscode.commands.executeCommand("search.action.clearSearchResults").then(()=>{
				vscode.commands.executeCommand("workbench.action.closeSidebar").then(()=>{
					if (processResult === undefined){
						vscode.window.showErrorMessage(searchMessage);
					} else if (processResult === "Success"){
						if (replaceText === ""){
							replaceText = searchText;
						}
						vscode.window.showInformationMessage(`Replacement process for "${replaceText}" is successful`);
					}else {
						vscode.window.showErrorMessage(processResult);
					}
				});
			});
		});
	});

	let disposableRevertChanges = vscode.commands.registerCommand('tag-manager.revertChanges', async (searchText) => {
		if (rawContents.length > 0 && fileList.length > 0){
			for(let index=0; index < fileList.length; index++){
				await vscode.workspace.fs.writeFile(fileList[index], rawContents[index]);
			}
			vscode.window.showInformationMessage(`Rollback process for "${searchText}" is successfull`);
			rawContents.length = 0; fileList.length = 0;
			vscode.commands.executeCommand("tag-manager.searchTagAll", searchText);
		}
		else {
			vscode.window.showErrorMessage("Nothing found to revert");
		}
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
	context.subscriptions.push(disposableRevertChanges);
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
