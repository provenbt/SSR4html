import * as vscode from 'vscode';
import { UserInput, FileAndContent, ProcessResult } from '../interfaces';
import { replaceInFile } from './replaceInFile';
import strings from '../stringVariables.json';

export async function replaceInFiles(files: vscode.Uri[], replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResults: ProcessResult[] = [];

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

            if (result === ProcessResult.erroneous) {
                break;
            }

            progressCounter++;
            const progressPercentage = inc * progressCounter;
            progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}${strings.completedProcessPercantageMessage}` });
        }
    });

    return processResults;
}