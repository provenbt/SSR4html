import * as vscode from 'vscode';
import { convertToRegex } from './convertToRegexp';

export function searchInWorkspace(searchText: string){

    vscode.commands.executeCommand("workbench.action.findInFiles", {
        // Fill-in selected text to query
        query: convertToRegex(searchText),
        filesToInclude: "*.html",
        triggerSearch: true,
        isRegex: true,
        matchWholeWord: true,
        isCaseSensitive: true
    }); 
}

export function searchInFile(searchText: string, filePath: string){
    
    vscode.commands.executeCommand("workbench.action.findInFiles", {
        // Fill-in selected text to query
        query: convertToRegex(searchText),
        filesToInclude: `*${filePath}`,
        triggerSearch: true,
        isRegex: true,
        matchWholeWord: true,
        isCaseSensitive: true
    }); 
}