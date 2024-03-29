import * as vscode from 'vscode';
import { checkSearchText } from '../utilities/checkSearchText';
import { searchInWorkspace, searchInFile } from '../utilities/search';
import { checkReplacementText } from '../utilities/checkReplacementText';
import { replaceInFiles } from '../utilities/replaceInFiles';
import { replaceInFile } from '../utilities/replaceInFile';
import { revertChanges } from '../utilities/revertChanges';
import { generateRegExp } from '../utilities/generateRegExp';
import { UserInput, FileAndContent, ProcessResult } from '../interfaces';
import strings from '../../stringVariables.json';
const fs = require('fs');
const pretty = require('pretty');

export class StructuralSearchAndReplaceController {
    // Track the current controller. Only allow a single controller to exist at a time.
    public static currentController: StructuralSearchAndReplaceController;

    private workspaceState: vscode.Memento;
    private settings: vscode.WorkspaceConfiguration;

    private searchText: string;
    private choice: string;
    private replaceText: string;

    // To store all readable and writable HTML files found in the workspace
    private files: vscode.Uri[];
    // To exclude the desired files & folders in the workspace
    private filesToExcludePath: string;
    // To keep track of created and deleted files
    private fileWatcher: vscode.FileSystemWatcher;

    // To store the information of the current document, vital to search&replace only within a file
    private currentDocument: vscode.TextDocument | undefined;

    // To store the previous state of the changed file(s), vital to revert the most recent changes made in file(s).
    private filesAndContents: FileAndContent[];

    private constructor(workspaceState: vscode.Memento) {
        this.workspaceState = workspaceState;
        this.settings = vscode.workspace.getConfiguration("ssr4html");
        this.searchText = "";
        this.choice = strings.replacementOperationDefaultText;
        this.replaceText = "";
        this.files = [];
        this.filesToExcludePath = "";
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.html');
        this.currentDocument = undefined;
        this.filesAndContents = [];
    }

    public static async getInstance(workspaceState: vscode.Memento): Promise<StructuralSearchAndReplaceController> {
        if (!StructuralSearchAndReplaceController.currentController) {
            StructuralSearchAndReplaceController.currentController = new StructuralSearchAndReplaceController(workspaceState);
            await this.currentController.init();
        }

        return StructuralSearchAndReplaceController.currentController;
    }

    private async init() {
        // Find all HTML files that have read and write permission
        this.files = await this.findHtmlFiles();

        // If auto format is enabled, format HTML files on the activation of the extension
        if (this.settings.get("autoFormat")) {
            this.formatHtmlFiles();
        }

        // When a new readable and writable HTML file is created, add the file to the file list 
        this.fileWatcher.onDidCreate(uri => {
            if (this.isFileReadableAndWritable(uri)) {
                this.files.push(uri);
            }
        });

        // Remove deleted file from the list of files to be replaced in and to undo
        this.fileWatcher.onDidDelete(uri => {
            // Remove deleted file from the list of files to be replaced in
            const fileIndex1 = this.files.findIndex(file => file.path === uri.path);
            if (fileIndex1 > -1) {
                this.files.splice(fileIndex1, 1);
            }

            // Remove deleted file from the list of files to undo
            const fileIndex2 = this.filesAndContents.findIndex(fileAndContent => fileAndContent.file.path === uri.path);
            if (fileIndex2 > -1) {
                this.files.splice(fileIndex2, 1);
            }
        });
    }

    public async askToFormatHtmlFiles() {
        const answer = await vscode.window.showInformationMessage(strings.formatHtmlFilesQuestion, strings.formatHtmlFilesPositiveAnswer, strings.formatHtmlFilesNegativeAnswer);

        if (answer === strings.formatHtmlFilesPositiveAnswer) {
            this.formatHtmlFiles();
            this.settings.update("autoFormat", true, false);
        }
        else {
            vscode.window.showInformationMessage(strings.onRejectFormatHtmlFilesMessage);
            this.settings.update("autoFormat", false, false);
        }

        this.workspaceState.update("askForOnce", true);
    }

    public setSearchText(searchText: string) {
        this.searchText = searchText.trim();
    }

    public setFilesToExcludePath(filesToExcludePath: string) {
        this.filesToExcludePath = filesToExcludePath.split(',').map(v => v.trim()).filter(e => e !== "").map(v => v.startsWith('**/') ? v : '**/' + v).join(',');
    }

    public setChoice(choice: string) {
        this.choice = choice;
    }

    public setReplaceText(replaceText: string) {
        this.replaceText = replaceText.trim();
    }

    public setCurrentDocument(currentDocument: vscode.TextDocument | undefined) {
        this.currentDocument = currentDocument;
    }

    public getCurrentDocument(): vscode.TextDocument | undefined {
        return this.currentDocument;
    }

    public async formatHtmlFiles() {
        if (!this.isThereAnyHtmlFile()) {
            return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        for (let file of this.files) {
            const rawContent: Uint8Array = await vscode.workspace.fs.readFile(file);
            const oldHtmlText: string = decoder.decode(rawContent);
            const newHtmlText: string = pretty(oldHtmlText, { ocd: true });

            await vscode.workspace.fs.writeFile(file, encoder.encode(newHtmlText));
        }
    }

    public cleanUpInformationOfPreviouslyChangedFiles() {
        this.filesAndContents = [];
    }

    public checkSearchText(): string {
        return checkSearchText(this.searchText);
    }

    private async findHtmlFiles(): Promise<vscode.Uri[]> {
        const fileList: vscode.Uri[] = [];
        const allHtmlFiles = await vscode.workspace.findFiles('**/*.html', `{${this.filesToExcludePath}}`);

        // Get only HTML files that have read and write permission
        for (let file of allHtmlFiles) {
            if (this.isFileReadableAndWritable(file)) {
                fileList.push(file);
            }
        }

        return fileList;
    }

    public isFileReadableAndWritable(file: vscode.Uri): boolean {
        try {
            fs.accessSync(file.fsPath, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        }
        catch (err) {
            // File is not readable or writable
            return false;
        }
    }

    private generateRegExp(): string {
        return generateRegExp(this.searchText);
    }

    public async searchInWorkspace(): Promise<boolean> {
        const searchQuery = this.generateRegExp();

        // Find Html Files again in case of excluded files
        this.files = await this.findHtmlFiles();

        return await searchInWorkspace(searchQuery, this.files, this.filesToExcludePath);
    }

    public async searchInFile(): Promise<boolean> {
        const searchQuery = this.generateRegExp();
        const currentDocument = this.currentDocument?.fileName as string;

        // Find Html Files again in case of excluded files
        this.files = await this.findHtmlFiles();

        return await searchInFile(searchQuery, currentDocument, this.filesToExcludePath);
    }

    public checkReplacementText(): string {
        const { result, validatedReplaceText } = checkReplacementText(this.choice, this.replaceText);

        if (result === "Valid") {
            this.replaceText = validatedReplaceText as string;
        }

        return result;
    }

    public async replaceInFile(): Promise<ProcessResult> {
        const currentDocument = this.currentDocument?.uri as vscode.Uri;

        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${this.choice} ${strings.processProgressMessage}`,
            cancellable: false
        }, async () => {
            return await replaceInFile(currentDocument, replacementParameters, this.filesAndContents);
        });
    }

    public async replaceInFiles(): Promise<ProcessResult[]> {
        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return await replaceInFiles(this.files, replacementParameters, this.filesAndContents);
    }

    public isThereAnyHtmlFile(): boolean {
        return this.files.length !== 0;
    }

    public isThereAnyFileToRevertChanges(): boolean {
        return this.filesAndContents.length !== 0;
    }

    public async revertChanges(): Promise<ProcessResult> {
        return await revertChanges(this.filesAndContents);
    }

    public async notifyUser(processName: string, processResult: ProcessResult) {
        // Wait for a second to notify
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (processResult === ProcessResult.successful) {
            vscode.commands.executeCommand("search.action.refreshSearchResults");
            vscode.window.showInformationMessage(`${processName} ${strings.successfulProcessMessage}`);
        }
        else if (processResult === ProcessResult.unperformed) {
            vscode.window.showWarningMessage(strings.noChangeRequiredMessage);
        }
        else {
            vscode.window.showErrorMessage(`${strings.faultyProcessMessage} ${processName.toLowerCase()}`);

            // Revert made changes on a faulty replacement process
            if (processName === strings.replacementProcessName && this.isThereAnyFileToRevertChanges()) {
                // Wait for a second to show the next notification
                await new Promise(resolve => setTimeout(resolve, 1000));
                vscode.window.showInformationMessage(`${strings.onFaultyReplacementProcessMessage} ${strings.replacementProcessName.toLowerCase()}`);
                vscode.commands.executeCommand(strings.revertChangesCommand);
            }
        }
    }

    public dispose() {
        // Clean up HTML files found in the workspace
        this.files.splice(0, this.files.length);
        // Clean up all information of the previosly changed files
        this.filesAndContents.splice(0, this.filesAndContents.length);
        // Dispose the file system watcher
        this.fileWatcher.dispose();
    }
}