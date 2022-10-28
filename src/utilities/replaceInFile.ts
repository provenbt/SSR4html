import * as vscode from 'vscode';
import { UserInput, FileAndContent } from '../controllers/StructuralSearchAndReplaceController';
import { setClass } from './replacement-operations/setClass';
import { appendToClass } from './replacement-operations/appendToClass';
import { removeFromClass } from './replacement-operations/removeFromClass';
import { setId } from './replacement-operations/setId';
import { setAttribute } from './replacement-operations/setAttribute';
import { appendToAttribute } from './replacement-operations/appendToAttribute';
import { removeFromAttribute } from './replacement-operations/removeFromAttribute';
import { removeAttribute } from './replacement-operations/removeAttribute';
import { setStyleProperty } from './replacement-operations/setStyleProperty';
import { editStyleProperty } from './replacement-operations/editStyleProperty';
import { changeTagName } from './replacement-operations/changeTagName';
import { removeTag } from './replacement-operations/removeTag';
import { addUpperTag } from './replacement-operations/addUpperTag';
import { removeUpperTag } from './replacement-operations/removeUpperTag';
const jsdom = require("jsdom");
const pretty = require('pretty');

export async function replaceInFile(file: vscode.Uri, replacementParameters: UserInput, filesAndContents: FileAndContent[]) {
    let processResult: string;

    try {
        const { searchText, replaceText, choice } = replacementParameters;

        const rawContent: Uint8Array = await vscode.workspace.fs.readFile(file);
        const oldHtmlText: string = new TextDecoder().decode(rawContent);

        const domToModify = new jsdom.JSDOM(oldHtmlText);

        const querySelectorResults = domToModify.window.document.querySelectorAll(searchText);

        switch (choice) {
            case "Set Class":
                setClass(querySelectorResults, replaceText);
                break;

            case "Append to Class":
                appendToClass(querySelectorResults, replaceText);
                break;

            case "Remove from Class":
                removeFromClass(querySelectorResults, replaceText);
                break;

            case "Set Id":
                setId(querySelectorResults, replaceText);
                break;

            case "Set Attribute":
                setAttribute(querySelectorResults, replaceText);
                break;

            case "Append to Attribute":
                appendToAttribute(querySelectorResults, replaceText);
                break;

            case "Remove from Attribute":
                removeFromAttribute(querySelectorResults, replaceText);
                break;

            case "Remove Attribute":
                removeAttribute(querySelectorResults, replaceText);
                break;

            case "Set Style Property":
                setStyleProperty(querySelectorResults, replaceText);
                break;

            case "Edit Style Property":
                editStyleProperty(querySelectorResults, replaceText);
                break;

            case "Change Tag Name":
                changeTagName(querySelectorResults, replaceText);
                break;

            case "Remove Tag":
                removeTag(querySelectorResults);
                break;

            case "Add Upper Tag":
                addUpperTag(querySelectorResults, replaceText);
                break;

            case "Remove Upper Tag":
                removeUpperTag(querySelectorResults);
                break;

            default:
                throw new Error("Undefined Operation");
        }

        const newHtmlText = pretty(domToModify.serialize(), { ocd: true });

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