// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructuralSearchPanel } from './panels/StructuralSearchPanel';
import { replaceInFiles } from './utilities/replaceInFiles';
import { searchInWorkspace, searchInFile } from './utilities/search';
import { checkReplacementText } from './utilities/checkReplacementText';
import { replaceInFile } from './utilities/replaceInFile';
import { revertChanges } from './utilities/revertChanges';
import { notifyUser } from './utilities/notifyUser';

export function activate(context: vscode.ExtensionContext) {

	// To store the previous state of the files, vital to revert changes made in the file(s).
	const RAW_CONTENTS: Uint8Array[] = [];
	const FILE_LIST: vscode.Uri[] = [];

	let disposableSearchPanel = vscode.commands.registerCommand('tag-manager.searchPanelTag', () => {
		StructuralSearchPanel.render(context.extensionUri);
	});

	let disposableSearchInFiles = vscode.commands.registerCommand('tag-manager.searchInFiles', (searchText) => {
		searchInWorkspace(searchText);
	});


	let disposableSearchInFile = vscode.commands.registerCommand('tag-manager.searchInFile', (searchText) => {

		vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor").then(async () => {
			const editor = vscode.window.activeTextEditor;

			if (editor === undefined || editor.document === undefined) {
				return;
			}

			const filePath = editor.document.fileName;

			searchInFile(searchText, filePath);
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
		// Clean up the previous state of the files
		RAW_CONTENTS.splice(0, RAW_CONTENTS.length); FILE_LIST.splice(0, FILE_LIST.length);
		const { processResults, warningMessage } = await replaceInFiles(FILE_LIST, RAW_CONTENTS, choice, searchText, replaceText);
		const processResult = processResults.includes("Success") ? "Success" : "";

		setTimeout(() => {
			notifyUser(processResult, warningMessage, searchText, replaceText, choice);
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
			// Clean up the previous state of the files
			RAW_CONTENTS.splice(0, RAW_CONTENTS.length); FILE_LIST.splice(0, FILE_LIST.length);

			const htmlText = editor.document.getText();
			const file = editor.document.uri;

			const { processResult, warningMessage } = await replaceInFile(htmlText, choice, searchText, replaceText, file, FILE_LIST, RAW_CONTENTS);

			setTimeout(() => {
				notifyUser(processResult, warningMessage, searchText, replaceText, choice);
				// Enable interactive UI components after the API progress
				StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'unlockUIComponents' });
			}, 1000);
		});
	});

	let disposableRevertChanges = vscode.commands.registerCommand('tag-manager.revertChanges', (choice) => {

		if (FILE_LIST.length > 0 && RAW_CONTENTS.length > 0) {
			StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'lockUIComponents' });
			revertChanges(FILE_LIST, RAW_CONTENTS, choice).then(() => {
				setTimeout(() => {
					StructuralSearchPanel.currentPanel?.panel.webview.postMessage({ command: 'unlockUIComponents' });
				}, 1000);
			});
		}
		else {
			vscode.window.showErrorMessage("Nothing found to revert");
		}
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
