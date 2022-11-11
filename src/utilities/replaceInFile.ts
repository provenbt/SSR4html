import * as vscode from 'vscode';
import { UserInput, FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import { HtmlDom } from './HtmlDom';
import strings from '../stringVariables.json';
const pretty = require('pretty');

export async function replaceInFile(file: vscode.Uri, replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResult: string;

    try {
        const { searchText, replaceText, choice } = replacementParameters;

        const rawContent: Uint8Array = await vscode.workspace.fs.readFile(file);
        const oldHtmlText: string = new TextDecoder().decode(rawContent);

        const htmlDom: HtmlDom = new HtmlDom(oldHtmlText, searchText);

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
                htmlDom.changeTagName(replaceText);
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
            // Nothing Changed
            processResult = "NC";
        }
    }
    catch (error) {
        console.log(error);
        processResult = "Error";
    }

    return processResult;
}