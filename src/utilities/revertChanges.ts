import * as vscode from 'vscode';
import { FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import strings from '../stringVariables.json';

export async function revertChanges(filesAndContents: FileAndContent[]) {
    let processResult: string;

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${strings.revertProcessName} ${strings.processProgressMessage}`,
            cancellable: false
        }, async () => {
            for (let index = 0; index < filesAndContents.length; index++) {
                const { file, rawContent } = filesAndContents[index];
                await vscode.workspace.fs.writeFile(file, rawContent);
            }
        });

        // Since the rollback process for the last replacement process has already done,
        // clean up all information of the previosly changed files
        filesAndContents.splice(0, filesAndContents.length);

        processResult = "Success";
    } catch (error) {
        console.log(error);
        processResult = "Error";
    }

    return processResult;
}