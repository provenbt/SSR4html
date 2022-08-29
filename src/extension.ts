// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getQuerySelectorResults } from './utilities/getQuerySelectorResults';
import {StructuralSearchPanel} from './panels/StructuralSearchPanel';
import { replaceInFile } from './utilities/replaceInFile';
import { searchInWorkspace } from './utilities/searchInWorkspace';
import { revertChanges } from './utilities/revertChanges';
import { notifyUser } from './utilities/notifyUser';

export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchTagAll = vscode.commands.registerCommand('tag-manager.searchTagAll', (searchText) => {
		searchInWorkspace(searchText);
	});

	const rawContents : Uint8Array[] = [];
	const fileList: vscode.Uri[] = [];

	let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceTagAll', async (searchText, replaceText, choice) => {
		let processResult : string = "";
		let searchMessage : string = "";

		const files = await vscode.workspace.findFiles('**/*.{html}','**/node_modules/**');
		const jsdom = require("jsdom");

		for(let file of files){
			const rawContent = await vscode.workspace.fs.readFile(file);
			const htmlText = new TextDecoder().decode(rawContent);
			
			const dom = new jsdom.JSDOM(htmlText);
			const {results, searchResult} = getQuerySelectorResults(dom, searchText);
			
			if (results !== null && results.length > 0){
				processResult = replaceInFile(results, choice, replaceText, file, dom);
				
				if (processResult === "Success"){
					rawContents.push(rawContent);
					fileList.push(file);
				}

				else {
					break;
				}
			}
			else {
				searchMessage = searchResult;
			}
		}

		notifyUser(processResult,searchMessage,searchText,replaceText,choice);
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
