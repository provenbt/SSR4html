import * as vscode from 'vscode';

export function notifyUser(processName: string, processResult: string, choice: string) {
    if (processResult === "Success") {
        vscode.commands.executeCommand("search.action.refreshSearchResults").then(() => {
            vscode.window.showInformationMessage(`${processName} process for "${choice.toLowerCase()}" successful`);
        });
    }
    else if (processResult === "No modifications required for the desired change") {
        vscode.window.showWarningMessage(processResult);
    }
    else {
        vscode.window.showErrorMessage(`An error occured during the ${processName} process`);
    }
}