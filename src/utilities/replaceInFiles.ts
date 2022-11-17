import * as vscode from 'vscode';
import { UserInput, FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import { replaceInFile } from './replaceInFile';
import strings from '../stringVariables.json';

export async function replaceInFiles(files: vscode.Uri[], replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResults: string[] = [];

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `${replacementParameters.choice} ${strings.processProgressMessage}`,
        cancellable: false
    }, async (progress) => {
        const inc = Math.round(100 / files.length);
        let progressCounter = 0;

        for (let file of files) {
            const result = await replaceInFile(file, replacementParameters, filesAndContents);
            processResults.push(result);

            if (result === "Error") {
                break;
            }

            progressCounter++;
            const progressPercentage = inc * progressCounter;
            progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}${strings.completedProcessPercantageMessage}` });
        }
    });

    return processResults;
}