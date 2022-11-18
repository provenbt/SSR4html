import {Uri} from 'vscode';

export interface UserInput {
    searchText: string,
    replaceText: string,
    choice: string
}

export interface FileAndContent {
    file: Uri,
    rawContent: Uint8Array
}

export enum ProcessResult {  
    erroneous = -1,
    unperformed = 0,
    successful = 1
}