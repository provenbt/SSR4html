// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructuralSearchPanel } from './panels/StructuralSearchPanel';
import { replaceInFiles } from './utilities/replaceInFiles';
import { searchInWorkspace } from './utilities/searchInWorkspace';
import { revertChanges } from './utilities/revertChanges';
import { notifyUser } from './utilities/notifyUser';

export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchTagAll = vscode.commands.registerCommand('tag-manager.searchInFiles', (searchText) => {
		searchInWorkspace(searchText);
	});

	const rawContents: Uint8Array[] = [];
	const fileList: vscode.Uri[] = [];

	let disposableReplaceTagAll = vscode.commands.registerCommand('tag-manager.replaceInFiles', async (searchText, replaceText, choice) => {

		const files = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');

		const { processResult, searchMessage } = await replaceInFiles(files, fileList, rawContents, choice, searchText, replaceText);

		setTimeout(() => {
			notifyUser(processResult, searchMessage, searchText, replaceText, choice);
		}, 1000);
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
export function deactivate() { }
