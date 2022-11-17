import * as vscode from 'vscode';
import { StructuralSearchAndReplacePanel } from './panels/StructuralSearchAndReplacePanel';
import { StructuralSearchAndReplaceController } from './controllers/StructuralSearchAndReplaceController';
import strings from './stringVariables.json';

// A controller will be created to manage the services of the extension
let controller: StructuralSearchAndReplaceController;

// The extension's user interface will be assigned when it is launched or closed by the user
let extensionUI: StructuralSearchAndReplacePanel | undefined;

export function activate(context: vscode.ExtensionContext) {
	controller = StructuralSearchAndReplaceController.getInstance(context.workspaceState);

	let disposableSearchPanel = vscode.commands.registerCommand(strings.launchOrCloseUIcommand, async () => {
		// If there is not any readable and writable HTML file, do not launch UI
		const files = await controller.findHtmlFiles();
		if (files.length === 0) {
			vscode.window.showWarningMessage(strings.UIWarningMessage);
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

	let disposablesFormatFiles = vscode.commands.registerCommand(strings.formatFilesCommand, () => {
		controller.formatHtmlFiles();
	});

	let disposableSearchInFiles = vscode.commands.registerCommand(strings.searchInFilesCommand, async (searchText, filesToExcludePath) => {
		controller.setSearchText(searchText);
		controller.setFilesToExcludePath(filesToExcludePath);

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
			vscode.window.showWarningMessage(strings.nothingFoundToModifyInWorkspaceMessage);
		}

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
	});


	let disposableSearchInFile = vscode.commands.registerCommand(strings.searchInFileCommand, async (searchText) => {
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
			vscode.window.showWarningMessage(strings.invalidDocumentIsOpenedMessage);
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
			vscode.window.showWarningMessage(`${strings.nothingFoundToModifyInFileMessage} ${controller.getCurrentDocument()?.fileName}`);
		}

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
	});

	let disposableReplaceInFiles = vscode.commands.registerCommand(strings.replaceInFilesCommand, async (replaceText, choice) => {
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
			// Nothing changed in files
			processResult = "NC";
		}

		setTimeout(() => {
			extensionUI?.notifyUser(strings.replacementProcessName, processResult);

			// Revert made changes on a faulty replacement process
			if (processResult === "Error" && controller.isThereAnyFileToRevertChanges()) {
				vscode.window.showInformationMessage(`${strings.onFaultyReplacementProcessMessage} ${strings.replacementProcessName.toLowerCase()}`);
				vscode.commands.executeCommand(strings.revertChangesCommand);
			}

			// Enable interactive UI components after the API progress
			extensionUI?.unlockUIComponents();
		}, 1000);
	});

	let disposableReplaceInFile = vscode.commands.registerCommand(strings.replaceInFileCommand, async (replaceText, choice) => {
		// Warn user if the current file does not have read and write permission
		if (!controller.isFileReadableAndWritable(controller.getCurrentDocument()!.uri)) {
			vscode.window.showWarningMessage(`${strings.notReadableOrWritableMessage} ${controller.getCurrentDocument()?.fileName}`);
			return;
		}

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

		let processResult: string;
		// Show progress of the replacement process
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `${choice} ${strings.processProgressMessage}`,
			cancellable: false
		}, async () => {
			processResult = await controller.replaceInFile();
		});

		setTimeout(() => {
			extensionUI?.notifyUser(strings.replacementProcessName, processResult);

			// Revert made changes on a faulty replacement process
			if (processResult === "Error" && controller.isThereAnyFileToRevertChanges()) {
				vscode.window.showInformationMessage(`${strings.onFaultyReplacementProcessMessage} ${strings.replacementProcessName.toLowerCase()}`);
				vscode.commands.executeCommand(strings.revertChangesCommand);
			}

			// Enable interactive UI components after the API progress
			extensionUI?.unlockUIComponents();
		}, 1000);
	});

	let disposableRevertChanges = vscode.commands.registerCommand(strings.revertChangesCommand, async () => {

		if (!controller.isThereAnyFileToRevertChanges()) {
			vscode.window.showWarningMessage(strings.nothingFoundToRevertMessage);
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();
		const processResult = await controller.revertChanges();

		setTimeout(() => {
			extensionUI?.notifyUser(strings.revertProcessName, processResult);

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