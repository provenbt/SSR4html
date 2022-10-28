import * as vscode from "vscode";
import { checkSearchText } from '../utilities/checkSearchText';
import { searchInWorkspace, searchInFile } from '../utilities/search';
import { checkReplacementText } from '../utilities/checkReplacementText';
import { replaceInFiles } from '../utilities/replaceInFiles';
import { replaceInFile } from '../utilities/replaceInFile';
import { revertChanges } from '../utilities/revertChanges';

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

    private searchText: string;
    private choice: string;
    private replaceText: string;

    // To store all HTML files found in the workspace
    private files: vscode.Uri[];

    // To store the information of the current document, vital to search&replace only within a file
    private currentDocument: vscode.TextDocument | undefined;

    // To store the previous state of the changed file(s), vital to revert the most recent changes made in file(s).
    private filesAndContents: FileAndContent[];

    private constructor() {
        this.searchText = "";
        this.choice = "Unselected";
        this.replaceText = "";
        this.files = [];
        this.currentDocument = undefined;
        this.filesAndContents = [];
    }

    public static getInstance(): StructuralSearchAndReplaceController {
        if (!StructuralSearchAndReplaceController.currentController) {
            StructuralSearchAndReplaceController.currentController = new StructuralSearchAndReplaceController();
        }

        return StructuralSearchAndReplaceController.currentController;
    }

    public setSearchText(searchText: string) {
        this.searchText = searchText.trim();
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

    public getSearchText(): string {
        return this.searchText;
    }

    public getChoice(): string {
        return this.choice;
    }

    public getReplaceText(): string {
        return this.replaceText;
    }

    public getCurrentDocument(): vscode.TextDocument | undefined {
        return this.currentDocument;
    }

    public cleanUpInformationOfPreviouslyChangedFiles() {
        this.filesAndContents = [];
    }

    public checkSearchText(): string {
        return checkSearchText(this.searchText);
    }

    public async findHtmlFiles(): Promise<vscode.Uri[]> {
        this.files = await vscode.workspace.findFiles('**/*.html');
        return this.files;
    }

    public searchInWorkspace(): Promise<boolean> {
        return searchInWorkspace(this.searchText);
    }

    public searchInFile(): Promise<boolean> {
        return searchInFile(this.searchText, this.currentDocument?.fileName as string);
    }

    public checkReplacementText(): string {
        const { result, validatedReplaceText } = checkReplacementText(this.choice, this.replaceText);

        if (result === "Valid") {
            this.replaceText = validatedReplaceText as string;
        }

        return result;
    }

    public replaceInFile(): Promise<string> {
        const currentDocument = this.currentDocument?.uri as vscode.Uri;

        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return replaceInFile(currentDocument, replacementParameters, this.filesAndContents);
    }

    public replaceInFiles(): Promise<string[]> {
        const replacementParameters: UserInput = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            choice: this.choice
        };

        return replaceInFiles(this.files, replacementParameters, this.filesAndContents);
    }

    public isThereAnyFileToRevertChanges() {
        return this.filesAndContents.length !== 0;
    }

    public revertChanges(): Promise<string> {
        return revertChanges(this.filesAndContents);
    }
}