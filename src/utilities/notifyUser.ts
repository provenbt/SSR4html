import * as vscode from 'vscode';

export function notifyUser(processResult: string, warningMessage: string, searchText: string, replaceText: string, choice: string){
    if (processResult === ""){
        vscode.window.showWarningMessage(warningMessage !== "" ? warningMessage : "No modifications required as the desired changes are already there");
    } else if (processResult === "Success"){
        vscode.commands.executeCommand("search.action.refreshSearchResults").then(()=>{
            replaceText = replaceText !== "" ? replaceText : searchText;
            vscode.window.showInformationMessage(`${choice} process for "${replaceText}" successful`);
        });
    }else {
        vscode.window.showErrorMessage(processResult);
    }
}