import * as vscode from 'vscode';
import { replaceInFile } from './replaceInFile';

export async function replaceInFiles(fileList: vscode.Uri[], rawContents: Uint8Array[], choice: string, searchText: string, replaceText: string) {
    let processResults: string[] = [];
    let warningMessage: string = "";

    const files = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
    const numOfFiles = files.length;

    if (numOfFiles === 0) {
        warningMessage = "There is not any HTML file in the workspace";
    }
    else {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${choice} process is under the progress`,
            cancellable: false
        }, async (progress) => {

            let inc = Math.round(100 / numOfFiles);
            let progressCounter = 0;

            for (let file of files) {
                const rawContent = await vscode.workspace.fs.readFile(file);
                const htmlText = new TextDecoder().decode(rawContent);

                const result = await replaceInFile(htmlText, choice, searchText, replaceText, file, fileList, rawContents);
                processResults.push(result.processResult);
                warningMessage = result.warningMessage;

                progressCounter++;
                let progressPercentage = inc * progressCounter;
                progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}% completed` });
            }
        });
    }

    return { processResults, warningMessage };
}