import * as vscode from 'vscode';
import { StructuralSearchPanel } from './panels/StructuralSearchPanel';
import { checkSearchText } from './utilities/checkSearchText';
import { searchInWorkspace, searchInFile } from './utilities/search';
import { checkReplacementText } from './utilities/checkReplacementText';
import { replaceInFiles } from './utilities/replaceInFiles';
import { replaceInFile } from './utilities/replaceInFile';
import { revertChanges } from './utilities/revertChanges';
import { notifyUser } from './utilities/notifyUser';

export function activate(context: vscode.ExtensionContext) {

	// To store the previous state of the files, vital to revert the most recent changes made in file(s).
	const RAW_CONTENTS: Uint8Array[] = [];
	const FILE_LIST: vscode.Uri[] = [];

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchInFiles = vscode.commands.registerCommand('tag-manager.searchInFiles', async (searchText) => {

		const files = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
		if (files.length === 0) {
			vscode.window.showWarningMessage("There is not any HTML file in the workspace");
			return;
		}

		const isCssSelectorValid = checkSearchText(searchText);
		if (isCssSelectorValid !== "Valid") {
			vscode.window.showWarningMessage(isCssSelectorValid);
			return;
		}

		const isThereAnyMatch = await searchInWorkspace(searchText);

		if (isThereAnyMatch) {
			StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'onFoundSearchResult' });
		}
		else {
			vscode.window.showWarningMessage("Nothing found to modify");
		}

	});


	let disposableSearchInFile = vscode.commands.registerCommand('tag-manager.searchInFile', (searchText) => {

		vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor").then(async () => {

			const editor = vscode.window.activeTextEditor;
			if (editor === undefined || editor.document === undefined) {
				vscode.window.showWarningMessage("Please, open a HTML file");
				return;
			}

			if (!(editor.document.uri.toString().endsWith(".html"))) {
				vscode.window.showWarningMessage("The current file is not an HTML file");
				return;
			}

			const isCssSelectorValid = checkSearchText(searchText);
			if (isCssSelectorValid !== "Valid") {
				vscode.window.showWarningMessage(isCssSelectorValid);
				return;
			}

			const isThereAnyMatch = await searchInFile(searchText, editor.document.fileName);

			if (isThereAnyMatch) {
				StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'onFoundSearchResult' });
			}
			else {
				vscode.window.showWarningMessage("Nothing found to modify");
			}
		});
	});

	let disposableReplaceInFiles = vscode.commands.registerCommand('tag-manager.replaceInFiles', async (searchText, replaceText, choice) => {

		const isReplacementTextValid = checkReplacementText(choice, replaceText);
		if (isReplacementTextValid !== "Valid") {
			vscode.window.showWarningMessage(isReplacementTextValid);
			return;
		}

		// Disable interactive UI components during the API progress
		StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'lockUIComponents' });
		// Since only the effects of the last replacement process will be reverted,
		// clean up all information of the previosly changed files before a new replacement process
		RAW_CONTENTS.splice(0, RAW_CONTENTS.length); FILE_LIST.splice(0, FILE_LIST.length);

		const processResults = await replaceInFiles(FILE_LIST, RAW_CONTENTS, choice, searchText, replaceText);

		let processResult: string;
		if (processResults.includes("Error")) {
			processResult = "Error";
		} else if (processResults.includes("Success")) {
			processResult = "Success";
		} else {
			processResult = "No modifications required for the desired change";
		}

		setTimeout(() => {
			notifyUser("Replacement", processResult, choice);
			// Enable interactive UI components after the API progress
			StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'unlockUIComponents' });
		}, 1000);
	});

	let disposableReplaceInFile = vscode.commands.registerCommand('tag-manager.replaceInFile', (searchText, replaceText, choice) => {

		vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor").then(async () => {

			const editor = vscode.window.activeTextEditor;
			if (editor === undefined || editor.document === undefined) {
				return;
			}

			const isReplacementTextValid = checkReplacementText(choice, replaceText);
			if (isReplacementTextValid !== "Valid") {
				vscode.window.showWarningMessage(isReplacementTextValid);
				return;
			}

			// Disable interactive UI components during the API progress
			StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'lockUIComponents' });
			// Since only the effects of the last replacement process will be reverted,
			// clean up all information of the previosly changed files before a new replacement process
			RAW_CONTENTS.splice(0, RAW_CONTENTS.length); FILE_LIST.splice(0, FILE_LIST.length);

			const processResult = await replaceInFile(editor.document.uri, choice, searchText, replaceText, FILE_LIST, RAW_CONTENTS);

			setTimeout(() => {
				notifyUser("Replacement", processResult, choice);
				// Enable interactive UI components after the API progress
				StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'unlockUIComponents' });
			}, 1000);
		});
	});

	let disposableRevertChanges = vscode.commands.registerCommand('tag-manager.revertChanges', async (choice) => {

		if (FILE_LIST.length === 0 || RAW_CONTENTS.length === 0) {
			vscode.window.showWarningMessage("Nothing found to revert");
			return;
		}

		// Disable interactive UI components during the API progress
		StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'lockUIComponents' });
		const processResult = await revertChanges(FILE_LIST, RAW_CONTENTS);

		setTimeout(() => {
			notifyUser("Rollback", processResult, choice);
			// Enable interactive UI components after the API progress
			StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'unlockUIComponents' });
		}, 1000);
	});

	context.subscriptions.push(disposableSearchPanel);
	context.subscriptions.push(disposableSearchInFiles);
	context.subscriptions.push(disposableSearchInFile);
	context.subscriptions.push(disposableReplaceInFiles);
	context.subscriptions.push(disposableReplaceInFile);
	context.subscriptions.push(disposableRevertChanges);
}

// this method is called when your extension is deactivated
export function deactivate() { }
