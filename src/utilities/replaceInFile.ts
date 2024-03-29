import * as vscode from 'vscode';
import { UserInput, FileAndContent, ProcessResult } from '../interfaces';
import { HtmlDom } from './HtmlDom';
import strings from '../../stringVariables.json';
const pretty = require('pretty');

export async function replaceInFile(file: vscode.Uri, replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResult: ProcessResult;

    try {
        const { searchText, replaceText, choice } = replacementParameters;

        const rawContent: Uint8Array = await vscode.workspace.fs.readFile(file);
        const oldHtmlText: string = new TextDecoder().decode(rawContent);

        const htmlDom: HtmlDom = new HtmlDom(oldHtmlText, searchText);

        if (htmlDom.getQuerySelectorResults().length < 1) {
            // There is not any occurences in the file so the replacement will not be performed
            return ProcessResult.unperformed;
        }

        switch (choice) {
            case strings.setClassNameText:
                htmlDom.setClass(replaceText);
                break;

            case strings.appendClassNameText:
                htmlDom.appendToClass(replaceText);
                break;

            case strings.removeClassNameText:
                htmlDom.removeFromClass(replaceText);
                break;

            case strings.setIdValueText:
                htmlDom.setId(replaceText);
                break;

            case strings.setAttributeText:
                htmlDom.setAttribute(replaceText);
                break;

            case strings.appendAttributeValueText:
                htmlDom.appendToAttribute(replaceText);
                break;

            case strings.removeAttributeValueText:
                htmlDom.removeFromAttribute(replaceText);
                break;

            case strings.removeAttributeText:
                htmlDom.removeAttribute(replaceText);
                break;

            case strings.setStylePropertyText:
                htmlDom.setStyleProperty(replaceText);
                break;

            case strings.editStylePropertyText:
                htmlDom.editStyleProperty(replaceText);
                break;

            case strings.editTagNameText:
                htmlDom.editTagName(replaceText);
                break;

            case strings.removeTagText:
                htmlDom.removeTag();
                break;

            case strings.addUpperTagText:
                htmlDom.addUpperTag(replaceText);
                break;

            case strings.removeUpperTagText:
                htmlDom.removeUpperTag();
                break;

            default:
                throw new Error("Undefined Operation");
        }

        // Get the HTML text from the DOM and Format it
        const newHtmlText = pretty(htmlDom.getDom().serialize(), { ocd: true });

        // Make sure the file needs to be overwritten
        if (oldHtmlText !== newHtmlText) {
            // Store the old state of the file 
            filesAndContents.push({
                file,
                rawContent
            });

            // Overwrite the file
            await vscode.workspace.fs.writeFile(file, new TextEncoder().encode(newHtmlText));

            // The replacement is succesfull
            processResult = ProcessResult.successful;
        }
        else {
            // The replacement did not change anything
            // Can be think as the replacement was not performed (No change required)
            processResult = ProcessResult.unperformed;
        }
    }
    catch (error) {
        console.log(error);
        // An error occured during the replacement
        processResult = ProcessResult.erroneous;
    }

    return processResult;
}