import * as vscode from "vscode";
import { checkSearchText } from '../utilities/checkSearchText';
import { searchInWorkspace, searchInFile } from '../utilities/search';
import { checkReplacementText } from '../utilities/checkReplacementText';
import { replaceInFiles } from '../utilities/replaceInFiles';
import { replaceInFile } from '../utilities/replaceInFile';
import { revertChanges } from '../utilities/revertChanges';

export class StructuralSearchAndReplaceController {
    // Track the current controller. Only allow a single controller to exist at a time.
    public static currentController: StructuralSearchAndReplaceController;

    private searchText: string;
    private choice: string;
    private replaceText: string;

    // To store the information of the current document, vital to search&replace only within a file
    private currentDocument: vscode.TextDocument | undefined;

    // To store the previous state of the files, vital to revert the most recent changes made in file(s).
    private rawContents: Uint8Array[];
    private fileList: vscode.Uri[];

    private constructor() {
        this.searchText = "";
        this.choice = "Unselected";
        this.replaceText = "";
        this.currentDocument = undefined;
        this.rawContents = [];
        this.fileList = [];
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
        this.rawContents = [];
        this.fileList = [];
    }

    public checkSearchText(): string {
        return checkSearchText(this.searchText);
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
        return replaceInFile(this.currentDocument?.uri as vscode.Uri, this.choice, this.searchText, this.replaceText, this.fileList, this.rawContents);
    }

    public replaceInFiles(): Promise<string[]> {
        return replaceInFiles(this.fileList, this.rawContents, this.choice, this.searchText, this.replaceText);
    }

    public isThereAnyFileToRevertChanges() {
        return this.fileList.length !== 0;
    }

    public revertChanges(): Promise<string> {
        return revertChanges(this.fileList, this.rawContents);
    }
}