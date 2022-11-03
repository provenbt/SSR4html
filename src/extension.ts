import * as vscode from 'vscode';
import { StructuralSearchAndReplacePanel } from './panels/StructuralSearchAndReplacePanel';
import { StructuralSearchAndReplaceController } from './controllers/StructuralSearchAndReplaceController';

// A controller will be created to manage the services of the extension
let controller: StructuralSearchAndReplaceController;

// The extension's user interface will be assigned when it is launched or closed by the user
let extensionUI: StructuralSearchAndReplacePanel | undefined;

export function activate(context: vscode.ExtensionContext) {
	controller = StructuralSearchAndReplaceController.getInstance(context.workspaceState);

	let disposableSearchPanel = vscode.commands.registerCommand('ssr4html.launchUI&closeUI', async () => {
		const files = await controller.findHtmlFiles();;
		if (files.length === 0) {
			vscode.window.showWarningMessage("UI is not launched since there is not any HTML file in the workspace");
			return;
		}

		// If the UI is not shown, it will be launched (created); otherwise, it will be closed (disposed)
		StructuralSearchAndReplacePanel.launchOrCloseUI(context.extensionUri);
		extensionUI = StructuralSearchAndReplacePanel.currentPanel;

		// If UI is shown, ask to format HTML files (only once for a workspace)
		if (extensionUI && context.workspaceState.get("formatHtmlFiles") === undefined) {
			controller.askToFormatHtmlFiles();
		}
	});

	let disposablesFormatFiles = vscode.commands.registerCommand('ssr4html.formatFiles', () => {
		controller.formatHtmlFiles();
	});

	let disposableSearchInFiles = vscode.commands.registerCommand('ssr4html.searchInFiles', async (searchText) => {
		controller.setSearchText(searchText);

		const isCssSelectorValid = controller.checkSearchText();
		if (isCssSelectorValid !== "Valid") {
			vscode.window.showWarningMessage(isCssSelectorValid);
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();

		const isThereAnyMatch = await controller.searchInWorkspace();
		if (isThereAnyMatch) {
			extensionUI?.showReplacementPart();
		}
		else {
			vscode.window.showWarningMessage("Nothing found to modify in the workspace");
		}

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
	});


	let disposableSearchInFile = vscode.commands.registerCommand('ssr4html.searchInFile', async (searchText) => {
		controller.setSearchText(searchText);

		const isCssSelectorValid = controller.checkSearchText();
		if (isCssSelectorValid !== "Valid") {
			vscode.window.showWarningMessage(isCssSelectorValid);
			return;
		}

		// Open the previously active editor
		await vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor");

		const editor = vscode.window.activeTextEditor;
		if (editor === undefined || editor.document === undefined || !(editor.document.uri.toString().endsWith(".html"))) {
			controller.setCurrentDocument(undefined);
			vscode.window.showWarningMessage("Ensure that an HTML file has been opened in the active text editor");
			return;
		}

		controller.setCurrentDocument(editor.document);

		// Go back to the extension UI
		await vscode.commands.executeCommand("workbench.action.openNextRecentlyUsedEditor");

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();

		const isThereAnyMatch = await controller.searchInFile();
		if (isThereAnyMatch) {
			extensionUI?.showReplacementPart();
		}
		else {
			vscode.window.showWarningMessage(`Nothing found to modify in ${controller.getCurrentDocument()?.fileName}`);
		}

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
	});

	let disposableReplaceInFiles = vscode.commands.registerCommand('ssr4html.replaceInFiles', async (replaceText, choice) => {
		controller.setReplaceText(replaceText);
		controller.setChoice(choice);

		const isReplacementTextValid = controller.checkReplacementText();
		if (isReplacementTextValid !== "Valid") {
			vscode.window.showWarningMessage(isReplacementTextValid);
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();

		// Since only the effects of the last replacement process will be reverted,
		// clean up all information of the previosly changed files before a new replacement process
		controller.cleanUpInformationOfPreviouslyChangedFiles();

		const processResults = await controller.replaceInFiles();

		let processResult: string;
		if (processResults.includes("Error")) {
			processResult = "Error";
		} else if (processResults.includes("Success")) {
			processResult = "Success";
		} else {
			processResult = "No modifications required for the desired change";
		}

		setTimeout(() => {
			controller.notifyUser("Replacement", processResult);

			// Enable interactive UI components after the API progress
			extensionUI?.unlockUIComponents();
		}, 1000);
	});

	let disposableReplaceInFile = vscode.commands.registerCommand('ssr4html.replaceInFile', async (replaceText, choice) => {
		controller.setReplaceText(replaceText);
		controller.setChoice(choice);

		const isReplacementTextValid = controller.checkReplacementText();
		if (isReplacementTextValid !== "Valid") {
			vscode.window.showWarningMessage(isReplacementTextValid);
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();

		// Since only the effects of the last replacement process will be reverted,
		// clean up all information of the previosly changed files before a new replacement process
		controller.cleanUpInformationOfPreviouslyChangedFiles();

		// Show progress of the replacement process
		let processResult: string;
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `${choice} process is under the progress`,
			cancellable: false
		}, async () => {
			processResult = await controller.replaceInFile();
		});

		setTimeout(() => {
			controller.notifyUser("Replacement", processResult);

			// Enable interactive UI components after the API progress
			extensionUI?.unlockUIComponents();
		}, 1000);
	});

	let disposableRevertChanges = vscode.commands.registerCommand('ssr4html.revertChanges', async () => {

		if (!controller.isThereAnyFileToRevertChanges()) {
			vscode.window.showWarningMessage("Nothing found to revert");
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();
		const processResult = await controller.revertChanges();

		setTimeout(() => {
			controller.notifyUser("Rollback", processResult);

			// Enable interactive UI components after the API progress
			extensionUI?.unlockUIComponents();
		}, 1000);
	});

	context.subscriptions.push(disposableSearchPanel);
	context.subscriptions.push(disposablesFormatFiles);
	context.subscriptions.push(disposableSearchInFiles);
	context.subscriptions.push(disposableSearchInFile);
	context.subscriptions.push(disposableReplaceInFiles);
	context.subscriptions.push(disposableReplaceInFile);
	context.subscriptions.push(disposableRevertChanges);
}

export function deactivate() {
	// If the extension UI is still active when the extension is deactivated, dispose the extension UI
	if (extensionUI) {
		extensionUI.dispose();
	}

}