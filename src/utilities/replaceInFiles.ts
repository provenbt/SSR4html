import * as vscode from 'vscode';
import { replaceInFile } from './replaceInFile';

export async function replaceInFiles(fileList: vscode.Uri[], rawContents: Uint8Array[], choice: string, searchText: string, replaceText: string) {
    let processResults: string[] = [];

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `${choice} process is under the progress`,
        cancellable: false
    }, async (progress) => {
        const files = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
        let inc = Math.round(100 / files.length);
        let progressCounter = 0;

        for (let file of files) {
            const result = await replaceInFile(file, choice, searchText, replaceText, fileList, rawContents);
            processResults.push(result);

            progressCounter++;
            let progressPercentage = inc * progressCounter;
            progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}% completed` });
        }
    });

    return processResults;
}