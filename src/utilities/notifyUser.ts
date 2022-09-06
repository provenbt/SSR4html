import * as vscode from 'vscode';

export function notifyUser(processResult: string, searchMessage: string, searchText: string, replaceText: string, choice: string){
    if (processResult === ""){
        vscode.window.showWarningMessage(searchMessage);
    } else if (processResult === "Success"){
        vscode.commands.executeCommand("search.action.refreshSearchResults").then(()=>{
            if (replaceText === ""){
                replaceText = searchText;
            }
            vscode.window.showInformationMessage(`${choice} process for "${replaceText}" successful`);
        });
    }else {
        vscode.window.showErrorMessage(processResult);
    }
}