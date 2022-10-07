import * as vscode from 'vscode';

export async function revertChanges(fileList: vscode.Uri[], rawContents: Uint8Array[]) {
    let processResult: string;

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Rollback process is under the progress`,
            cancellable: false
        }, async () => {
            for (let index = 0; index < fileList.length; index++) {
                await vscode.workspace.fs.writeFile(fileList[index], rawContents[index]);
            }
        });

        // Since the rollback process for the last replacement process has already done,
        // clean up all information of the previosly changed files
        rawContents.splice(0, rawContents.length); fileList.splice(0, fileList.length);
        processResult = "Success";
    } catch (error) {
        console.log(error);
        processResult = `Error`;
    }

    return processResult;
}