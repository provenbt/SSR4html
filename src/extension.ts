// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getQuerySelectorResults } from './utilities/getQuerySelectorResults';
import {StructuralSearchPanel} from './panels/StructuralSearchPanel';
import { replaceInFile } from './utilities/replaceInFile';
import { convertToRegex } from './utilities/convertToRegexp';
import { revertChanges } from './utilities/revertChanges';

export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchTagAll = vscode.commands.registerCommand('tag-manager.searchTagAll', (searchText) => {
		
		vscode.workspace.findFiles('**/*.{html,js}','**/node_modules/**').then(files => {
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

					rawContents.push(rawContent);
					fileList.push(file);

					if (processResult !== "Success"){
						throw new Error("Replacement Error");
					}
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
						vscode.window.showInformationMessage(`${choice} process for "${replaceText}" successful`);
					}else {
						vscode.window.showErrorMessage(processResult);
					}
				});
			});
		});
	});

	let disposableRevertChanges = vscode.commands.registerCommand('tag-manager.revertChanges', (searchText, choice) => {
		revertChanges(fileList, rawContents, searchText, choice);
	});

	context.subscriptions.push(disposableSearchPanel);
	context.subscriptions.push(disposableSearchTagAll);
	context.subscriptions.push(disposableReplaceTagAll);
	context.subscriptions.push(disposableRevertChanges);
}

// this method is called when your extension is deactivated
export function deactivate() {}
