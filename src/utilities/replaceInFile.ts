import * as vscode from 'vscode';
import { UserInput, FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import { HtmlDom } from './HtmlDom';
const pretty = require('pretty');

export async function replaceInFile(file: vscode.Uri, replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResult: string;

    try {
        const { searchText, replaceText, choice } = replacementParameters;

        const rawContent: Uint8Array = await vscode.workspace.fs.readFile(file);
        const oldHtmlText: string = new TextDecoder().decode(rawContent);

        const htmlDom: HtmlDom = new HtmlDom(oldHtmlText, searchText);

        switch (choice) {
            case "Set Class":
                htmlDom.setClass(replaceText);
                break;

            case "Append to Class":
                htmlDom.appendToClass(replaceText);
                break;

            case "Remove from Class":
                htmlDom.removeFromClass(replaceText);
                break;

            case "Set Id":
                htmlDom.setId(replaceText);
                break;

            case "Set Attribute":
                htmlDom.setAttribute(replaceText);
                break;

            case "Append to Attribute":
                htmlDom.appendToAttribute(replaceText);
                break;

            case "Remove from Attribute":
                htmlDom.removeFromAttribute(replaceText);
                break;

            case "Remove Attribute":
                htmlDom.removeAttribute(replaceText);
                break;

            case "Set Style Property":
                htmlDom.setStyleProperty(replaceText);
                break;

            case "Edit Style Property":
                htmlDom.editStyleProperty(replaceText);
                break;

            case "Change Tag Name":
                htmlDom.changeTagName(replaceText);
                break;

            case "Remove Tag":
                htmlDom.removeTag();
                break;

            case "Add Upper Tag":
                htmlDom.addUpperTag(replaceText);
                break;

            case "Remove Upper Tag":
                htmlDom.removeUpperTag();
                break;

            default:
                throw new Error("Undefined Operation");
        }

        const newHtmlText = pretty(htmlDom.getDom().serialize(), { ocd: true });

        if (oldHtmlText !== newHtmlText) {
            // Store the old state of the file 
            filesAndContents.push({
                file,
                rawContent
            });

            // Overwrite the manipulated version of the file
            await vscode.workspace.fs.writeFile(file, new TextEncoder().encode(newHtmlText));

            processResult = "Success";
        }
        else {
            processResult = "No modifications required for the desired change";
        }
    }
    catch (error) {
        console.log(error);
        processResult = "Error";
    }

    return processResult;
}