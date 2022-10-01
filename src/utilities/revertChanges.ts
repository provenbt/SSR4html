import * as vscode from 'vscode';

export async function revertChanges(fileList: vscode.Uri[], rawContents: Uint8Array[], choice: string) {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Rollback process of "${choice.toLowerCase()}" is under the progress`,
            cancellable: false
        }, async () => {
            for (let index = 0; index < fileList.length; index++) {
                await vscode.workspace.fs.writeFile(fileList.pop() as vscode.Uri, rawContents.pop() as Uint8Array);
            }
        });

        // Clean up the previous state of the files
        rawContents.splice(0, rawContents.length); fileList.splice(0, fileList.length);

        setTimeout(() => {
            vscode.window.showInformationMessage(`Rollback process of "${choice.toLowerCase()}" successful`);
            vscode.commands.executeCommand("search.action.refreshSearchResults");
        }, 1000);
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage(`Error occured during the rollback process of "${choice.toLowerCase()}"`);
    }
}