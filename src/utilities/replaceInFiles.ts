import * as vscode from 'vscode';
import { UserInput, FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import { replaceInFile } from './replaceInFile';

export async function replaceInFiles(files: vscode.Uri[], replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResults: string[] = [];

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `${replacementParameters.choice} process is under the progress`,
        cancellable: false
    }, async (progress) => {
        let inc = Math.round(100 / files.length);
        let progressCounter = 0;

        for (let file of files) {
            const result = await replaceInFile(file, replacementParameters, filesAndContents);
            processResults.push(result);

            progressCounter++;
            let progressPercentage = inc * progressCounter;
            progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}% completed` });
        }
    });

    return processResults;
}