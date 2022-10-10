import * as vscode from 'vscode';
import { convertToRegex } from './convertToRegexp';

export async function searchInWorkspace(searchText: string) {
    await vscode.commands.executeCommand("workbench.action.findInFiles", {
        // Send the generated regular expression to query
        query: convertToRegex(searchText),
        // Search only in HTML files
        filesToInclude: "*.html",
        triggerSearch: true,
        isRegex: true,
        matchWholeWord: true,
        isCaseSensitive: true
    });

    return await isThereAnyMatch();
}

export async function searchInFile(searchText: string, filePath: string) {
    await vscode.commands.executeCommand("workbench.action.findInFiles", {
        // Send the generated regular expression to query
        query: convertToRegex(searchText),
        // Search only in the current file
        filesToInclude: `*${filePath}`,
        triggerSearch: true,
        isRegex: true,
        matchWholeWord: true,
        isCaseSensitive: true
    });

    return await isThereAnyMatch();
}

export async function isThereAnyMatch() {
    // Wait for the search result shown in the primary sidebar
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Store the recently copied text by the user)
    const oldClipboardText = await vscode.env.clipboard.readText();
    // Copy search result to the clipboard
    await vscode.commands.executeCommand('search.action.copyAll');
    // Get search result
    const searchResult = await vscode.env.clipboard.readText();
    // Rewrite the old content to the clipboard
    await vscode.env.clipboard.writeText(oldClipboardText);

    // Return false in case of search operation with no results 
    if (searchResult === "") {
        return false;
    }

    return true;
}