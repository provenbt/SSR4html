import * as vscode from 'vscode';

export async function revertChanges(fileList: vscode.Uri[], rawContents: Uint8Array[], searchText: string, choice: string) {
   
    if (fileList.length > 0) {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Rollback process of "${choice.toLowerCase()}" is under the progress`,
                cancellable: false
            }, async () => {
                for (let index = 0; index < fileList.length; index++) {
                    await vscode.workspace.fs.writeFile(fileList[index], rawContents[index]);
                }
            });

            setTimeout(() => {
                rawContents.length = 0; fileList.length = 0;
                vscode.window.showInformationMessage(`Rollback process of "${choice.toLowerCase()}" successful`);
                vscode.commands.executeCommand("tag-manager.searchInFiles", searchText);
            }, 1000);
        } catch (error) {
            console.log(error);
            vscode.window.showErrorMessage(`Error occured during rollback process of "${choice.toLowerCase()}"`);
        }
    }
    else {
        vscode.window.showErrorMessage("Nothing found to revert");
    }
}