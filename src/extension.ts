import * as vscode from 'vscode';
import { StructuralSearchAndReplacePanel } from './panels/StructuralSearchAndReplacePanel';
import { StructuralSearchAndReplaceController } from './controllers/StructuralSearchAndReplaceController';
import { ProcessResult } from './interfaces';
import strings from '../stringVariables.json';

// A controller will be created to manage the services of the extension
let controller: StructuralSearchAndReplaceController;

// The extension's user interface will be assigned when it is launched or closed by the user
let extensionUI: StructuralSearchAndReplacePanel | undefined;

export function activate(context: vscode.ExtensionContext) {

	let disposableSearchPanel = vscode.commands.registerCommand(strings.launchOrCloseUIcommand, async () => {
		// If there is not any workspace has been opened, do not launch UI
		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showWarningMessage(strings.UIWarningMessage);
			return;
		}

		// Create the controller
		controller = await StructuralSearchAndReplaceController.getInstance(context.workspaceState);

		// If the UI is not shown, it will be launched (created); otherwise, it will be closed (disposed)
		StructuralSearchAndReplacePanel.launchOrCloseUI(context.extensionUri);
		extensionUI = StructuralSearchAndReplacePanel.currentPanel;

		// If UI is shown, ask to format HTML files (ask only once for a workspace)
		if (extensionUI && context.workspaceState.get("askForOnce") === undefined) {
			controller.askToFormatHtmlFiles();
		}
	});

	let disposablesFormatFiles = vscode.commands.registerCommand(strings.formatFilesCommand, async () => {
		// If there is not any workspace has been opened, do not do anything
		if (vscode.workspace.workspaceFolders === undefined) {
			return;
		}

		// If the controller has not been created yet, create the controller
		if (!controller) {
			controller = await StructuralSearchAndReplaceController.getInstance(context.workspaceState);
		}

		await controller.formatHtmlFiles();
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

		let processResult: ProcessResult;
		if (processResults.includes(ProcessResult.erroneous)) {
			// An error occured during the replacement process of a file
			processResult = ProcessResult.erroneous;
		}
		else if (processResults.includes(ProcessResult.successful)) {
			// The replacement is successful at least in one file
			processResult = ProcessResult.successful;
		}
		else {
			// Nothing changed in files (there is no need for the replacement)
			processResult = ProcessResult.unperformed;
		}

		await controller.notifyUser(strings.replacementProcessName, processResult);

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
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

		const processResult = await controller.replaceInFile();

		await controller.notifyUser(strings.replacementProcessName, processResult);

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
	});

	let disposableRevertChanges = vscode.commands.registerCommand(strings.revertChangesCommand, async () => {
		// Warn user if there is not any file affected from the last replacement process
		if (!controller.isThereAnyFileToRevertChanges()) {
			vscode.window.showWarningMessage(strings.nothingFoundToRevertMessage);
			return;
		}

		// Disable interactive UI components during the API progress
		extensionUI?.lockUIComponents();

		const processResult = await controller.revertChanges();

		await controller.notifyUser(strings.revertProcessName, processResult);

		// Enable interactive UI components after the API progress
		extensionUI?.unlockUIComponents();
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
	// If the controller is still active when the extension is deactivated, dispose the controller
	if (controller) {
		controller.dispose();
	}

	// If the extension UI is still active when the extension is deactivated, dispose the extension UI
	if (extensionUI) {
		extensionUI.dispose();
	}
}