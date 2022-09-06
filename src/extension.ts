// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructuralSearchPanel } from './panels/StructuralSearchPanel';
import { replaceInFiles } from './utilities/replaceInFiles';
import { searchInWorkspace, searchInFile } from './utilities/search';
import { revertChanges } from './utilities/revertChanges';
import { notifyUser } from './utilities/notifyUser';

export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchInFiles = vscode.commands.registerCommand('tag-manager.searchInFiles', (searchText) => {
		searchInWorkspace(searchText);
	});

	
	let disposableSearchInFile= vscode.commands.registerCommand('tag-manager.searchInFile', (searchText) => {

		vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor").then( async () => {
			const editor = vscode.window.activeTextEditor;

			if(editor === undefined || editor.document === undefined){
				return;
			}

			const filePath = editor.document.fileName.split(/\/|\\/g);

			searchInFile(searchText, filePath);
		});
	});
	
	const rawContents: Uint8Array[] = [];
	const fileList: vscode.Uri[] = [];

	let disposableReplaceInFiles = vscode.commands.registerCommand('tag-manager.replaceInFiles', async (searchText, replaceText, choice) => {

		const { processResult, searchMessage } = await replaceInFiles(fileList, rawContents, choice, searchText, replaceText);

		setTimeout(() => {
			notifyUser(processResult, searchMessage, searchText, replaceText, choice);
		}, 1000);
	});

	let disposableRevertChanges = vscode.commands.registerCommand('tag-manager.revertChanges', (searchText, choice) => {
		revertChanges(fileList, rawContents, searchText, choice);
	});

	context.subscriptions.push(disposableSearchPanel);
	context.subscriptions.push(disposableSearchInFiles);
	context.subscriptions.push(disposableSearchInFile);
	context.subscriptions.push(disposableReplaceInFiles);
	context.subscriptions.push(disposableRevertChanges);
}

// this method is called when your extension is deactivated
export function deactivate() { }
