import * as vscode from 'vscode';
import { getQuerySelectorResults } from './getQuerySelectorResults';
import { createElementFromSelector } from './createElementFromSelector';
const pretty = require('pretty');
const jsdom = require("jsdom");

export async function replaceInFile(htmlText: string, choice: string, searchText: string, replaceText: string, file: vscode.Uri, fileList: vscode.Uri[], rawContents: Uint8Array[]) {
    let processResult: string = "";
    let searchMessage: string = "";

    let isFileChanged: boolean = false;
    replaceText = replaceText.trim();

    const dom = new jsdom.JSDOM(htmlText);
    const { results, searchResult } = getQuerySelectorResults(dom, searchText);

    try {
        if (searchResult === "Result found to replace") {
            for (let result of results) {
                switch (choice) {
                    case "Set Class":
                        result.className = replaceText;

                        isFileChanged = true;
                        break;
                    case "Append Class":
                        const classNamesToAppend = replaceText.split(' ');

                        for (let className of classNamesToAppend) {
                            result.classList.add(className);
                        }

                        isFileChanged = true;
                        break;
                    case "Set Id":
                        result.id = replaceText;

                        isFileChanged = true;
                        break;
                    case "Set Attribute":
                        const attributeValuePairs: string[] = replaceText.replaceAll(/"|'/g, '').split(',');

                        for (let attributeValuePair of attributeValuePairs) {
                            //Attribute name cannot include any kind of space character
                            let attribute = attributeValuePair.split('=')[0].replaceAll(' ', '');
                            let value = attributeValuePair.split('=')[1].trim();

                            result.setAttribute(attribute, value);
                        }

                        isFileChanged = true;
                        break;
                    case "Change Tag Name":
                        const newTagName = replaceText.replaceAll(' ', '');

                        const { document } = (new jsdom.JSDOM()).window;
                        // Create the document fragment 
                        const frag = document.createDocumentFragment();
                        // Fill it with what's in the source element 
                        while (result.firstChild) {
                            frag.appendChild(result.firstChild);
                        }
                        // Create the new element 
                        const newElem = document.createElement(newTagName);
                        // Empty the document fragment into it 
                        newElem.appendChild(frag);
                        //Get all attribute-value pairs
                        const attributeNames = result.getAttributeNames();
                        for (let name of attributeNames) {
                            let value = result.getAttribute(name);
                            newElem.setAttribute(name, value);
                        }
                        // Replace the source element with the new element on the page 
                        result.parentNode.replaceChild(newElem, result);

                        isFileChanged = true;
                        break;
                    case "Add Upper Tag":
                        const parentInfo = replaceText.replaceAll(' ', '');

                        const newParent = createElementFromSelector(parentInfo);

                        result.parentNode.insertBefore(newParent, result);
                        newParent.appendChild(result);

                        isFileChanged = true;
                        break;
                    case "Remove Tag":
                        result.remove();

                        isFileChanged = true;
                        break;
                    case "Remove Class":
                        const classNamesToRemove = replaceText.trim().split(' ');

                        for (let className of classNamesToRemove) {
                            if (result.classList.contains(className)) {
                                result.classList.remove(className);
                            }
                        }

                        isFileChanged = true;
                        break;
                    case "Remove Attribute":
                        replaceText = replaceText.trim().replaceAll(' ', '');
                        const attributesToRemove: string[] = replaceText.split(',');

                        for (let attribute of attributesToRemove) {
                            if (result.hasAttribute) {
                                result.removeAttribute(attribute);
                            }
                        }

                        isFileChanged = true;
                        break;
                    case "Remove Upper Tag":
                        if (result.parentElement === null) {
                            throw new Error(`${result.tagName.toLowerCase()} tag does not have an upper tag`);
                        }

                        //Remove any upper tag except HTML, HEAD and BODY tags
                        if (result.parentElement.tagName !== "HTML" && result.parentElement.tagName !== "HEAD" && result.parentElement.tagName !== "BODY") {
                            result.parentElement.replaceWith(...result.parentElement.childNodes);
                        }

                        isFileChanged = true;
                        break;
                }
            }
        }
        else {
            searchMessage = searchResult;
        }

        if (isFileChanged) {
            rawContents.push(new TextEncoder().encode(htmlText));
            fileList.push(file);
            await vscode.workspace.fs.writeFile(file, new TextEncoder().encode(pretty(dom.serialize(), { ocd: true })));
            processResult = "Success";
        }
    }
    catch (error: any) {
        console.log(error);
        processResult = error.message;
    }

    return { processResult, searchMessage };
}