import * as vscode from "vscode";
import { checkSearchText } from '../utilities/checkSearchText';
import { searchInWorkspace, searchInFile } from '../utilities/search';
import { checkReplacementText } from '../utilities/checkReplacementText';
import { replaceInFiles } from '../utilities/replaceInFiles';
import { replaceInFile } from '../utilities/replaceInFile';
import { revertChanges } from '../utilities/revertChanges';
import { generateRegExp } from "../utilities/generateRegExp";
import strings from '../stringVariables.json';
const fs = require('fs');
const pretty = require('pretty');

export interface UserInput {
    searchText: string,
    replaceText: string,
    choice: string
}

export interface FileAndContent {
    file: vscode.Uri,
    rawContent: Uint8Array
}

export class StructuralSearchAndReplaceController {
    // Track the current controller. Only allow a single controller to exist at a time.
    public static currentController: StructuralSearchAndReplaceController;

    private workspaceState: vscode.Memento;

    private searchText: string;
    private choice: string;
    private replaceText: string;

    // To store all readable and writable HTML files found in the workspace
    private files: vscode.Uri[];
    // To exclude the desired files & folders in the workspace
    private filesToExcludePath: string;

    // To store the information of the current document, vital to search&replace only within a file
    private currentDocument: vscode.TextDocument | undefined;

    // To store the previous state of the changed file(s), vital to revert the most recent changes made in file(s).
    private filesAndContents: FileAndContent[];

    private constructor(workspaceState: vscode.Memento) {
        this.workspaceState = workspaceState;
        this.searchText = "";
        this.choice = strings.replacementOperationDefaultText;
        this.replaceText = "";
        this.files = [];
        this.filesToExcludePath = "";
        this.currentDocument = undefined;
        this.filesAndContents = [];
    }

    public static getInstance(workspaceState: vscode.Memento): StructuralSearchAndReplaceController {
        if (!StructuralSearchAndReplaceController.currentController) {
            StructuralSearchAndReplaceController.currentController = new StructuralSearchAndReplaceController(workspaceState);
        }

        return StructuralSearchAndReplaceController.currentController;
    }

    public async askToFormatHtmlFiles() {
        const answer = await vscode.window.showInformationMessage(strings.formatHtmlFilesQuestion, strings.formatHtmlFilesPositiveAnswer, strings.formatHtmlFilesNegativeAnswer);

        if (answer === strings.formatHtmlFilesPositiveAnswer) {
            this.formatHtmlFiles();
        }
        else {
            vscode.window.showInformationMessage(strings.onRejectFormatHtmlFilesMessage);
            this.workspaceState.update("formatHtmlFiles", false);
        }
    }

    public setSearchText(searchText: string) {
        this.searchText = searchText.trim();
    }

    public setFilesToExcludePath(filesToExcludePath: string) {
        this.filesToExcludePath = filesToExcludePath.trim();
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
        if (this.files.length === 0) {
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

        this.workspaceState.update("formatHtmlFiles", true);
    }

    public cleanUpInformationOfPreviouslyChangedFiles() {
        this.filesAndContents = [];
    }

    public checkSearchText(): string {
        return checkSearchText(this.searchText);
    }

    public async findHtmlFiles(): Promise<vscode.Uri[]> {
        const fileList = [];
        const allHtmlFiles = await vscode.workspace.findFiles('**/*.html', this.filesToExcludePath);

        // Get only HTML files that have read and write permission
        for (let file of allHtmlFiles) {
            if (this.isFileReadableAndWritable(file)) {
                fileList.push(file);
            }
        }

        return this.files = fileList;
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

    private generateRegExp() {
        return generateRegExp(this.searchText);
    }

    public async searchInWorkspace(): Promise<boolean> {
        const searchQuery = this.generateRegExp();

        return searchInWorkspace(searchQuery, this.files, this.filesToExcludePath);
    }

    public async searchInFile(): Promise<boolean> {
        const searchQuery = this.generateRegExp();
        const currentDocument = this.currentDocument?.fileName as string;

        return searchInFile(searchQuery, currentDocument, this.filesToExcludePath);
    }

    public checkReplacementText(): string {
        const { result, validatedReplaceText } = checkReplacementText(this.choice, this.replaceText);

        if (result === "Valid") {
            this.replaceText = validatedReplaceText as string;
        }

        return result;
    }

    public async replaceInFile(): Promise<string> {
        const currentDocument = this.currentDocument?.uri as vscode.Uri;

        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return replaceInFile(currentDocument, replacementParameters, this.filesAndContents);
    }

    public async replaceInFiles(): Promise<string[]> {
        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return replaceInFiles(this.files, replacementParameters, this.filesAndContents);
    }

    public isThereAnyFileToRevertChanges(): boolean {
        return this.filesAndContents.length !== 0;
    }

    public async revertChanges(): Promise<string> {
        return revertChanges(this.filesAndContents);
    }
}