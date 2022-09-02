import * as vscode from 'vscode';
import { getQuerySelectorResults } from './getQuerySelectorResults';
import { replaceInFile } from './replaceInFile';
const jsdom = require("jsdom");

export async function replaceInFiles(fileList: vscode.Uri[], rawContents: Uint8Array[], choice: string, searchText: string, replaceText: string) {
    let processResult: string = "";
    let searchMessage: string = "";

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `${choice} process is under the progress`,
        cancellable: false
    }, async (progress) => {

        const files = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
        const numOfFiles = files.length;
        //If workspace is empty, it would give number/0 error
        let inc = numOfFiles > 0 ? Math.round(100 / numOfFiles) : 100;
        let progressCounter = 0;

        for (let file of files) {
            const rawContent = await vscode.workspace.fs.readFile(file);
            const htmlText = new TextDecoder().decode(rawContent);
            const dom = new jsdom.JSDOM(htmlText);
            const { results, searchResult } = getQuerySelectorResults(dom, searchText);

            if (results !== null && results.length > 0) {
                processResult = await replaceInFile(results, choice, replaceText, file, dom);

                if (processResult === "Success") {
                    rawContents.push(rawContent);
                    fileList.push(file);
                }
                else {
                    break;
                }
            }
            else {
                searchMessage = searchResult;
            }
            
            progressCounter++;
            let progressPercentage = inc * progressCounter;
            progress.report({ increment: inc, message: `${progressPercentage < 100 ? progressPercentage : 100}% completed` });
        }
    });

    return { processResult, searchMessage };
}