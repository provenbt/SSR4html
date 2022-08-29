import * as vscode from 'vscode';

export async function revertChanges(fileList: vscode.Uri[], rawContents: Uint8Array[], searchText: string, choice: string){
    if (fileList.length > 0){
        try {
            for(let index=0; index < fileList.length; index++){
                await vscode.workspace.fs.writeFile(fileList[index], rawContents[index]);
            }
            vscode.window.showInformationMessage(`Rollback process of "${choice.toLowerCase()}" successful`);
            rawContents.length = 0; fileList.length = 0;
            vscode.commands.executeCommand("tag-manager.searchInFiles", searchText);
        } catch (error) {
            console.log(error);
            vscode.window.showErrorMessage(`Error occured during rollback process of "${choice.toLowerCase()}"`);
        }
    }
    else {
        vscode.window.showErrorMessage("Nothing found to revert");
    }
}