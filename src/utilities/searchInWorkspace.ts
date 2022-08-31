import * as vscode from 'vscode';
import { convertToRegex } from './convertToRegexp';

export function searchInWorkspace(searchText: string){

    vscode.workspace.findFiles('**/*.html','**/node_modules/**').then(files => {
        vscode.commands.executeCommand("workbench.action.findInFiles", {
            // Fill-in selected text to query
            query: convertToRegex(searchText),
            filesToInclude: files,
            triggerSearch: true,
            isRegex: true,
            matchWholeWord: true,
            isCaseSensitive: true,
            replace: ''
        }); 
    });
}