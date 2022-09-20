import * as vscode from 'vscode';
import { getQuerySelectorResults } from './getQuerySelectorResults';
import { createElementFromSelector } from './createElementFromSelector';
const pretty = require('pretty');
const jsdom = require("jsdom");

export async function replaceInFile(htmlText: string, choice: string, searchText: string, replaceText: string, file: vscode.Uri, fileList: vscode.Uri[], rawContents: Uint8Array[]) {
    let processResult: string = "";
    let searchMessage: string = "";

    let changeFile: boolean = false;
    replaceText = replaceText.trim();

    const dom = new jsdom.JSDOM(htmlText);
    const { results, searchResult } = getQuerySelectorResults(dom, searchText);

    try {
        if (searchResult === "Result found to replace") {
            switch (choice) {
                case "Set Class":
                    for(let result of results){
                        result.className = replaceText;
                    }

                    changeFile = true;
                    break;

                case "Append to Class":
                    const classNamesToAppend = replaceText.split(' ');

                    for(let result of results){
                        for (let className of classNamesToAppend) {
                            //Remove spaces if classNames seperated with more than one white space char
                            className = className.trim();
                            result.classList.add(className);
                        }
                    }

                    changeFile = true;
                    break;

                case "Set Id":
                    for(let result of results){
                        result.id = replaceText;
                    }

                    changeFile = true;
                    break;

                case "Set Attribute":
                    const attributeValuePairs: string[] = replaceText.replace(/"|'/g, '').split(',');

                    for(let result of results){
                        for (let attributeValuePair of attributeValuePairs) {
                            //Attribute name cannot include any kind of space character
                            let attribute = attributeValuePair.split('=')[0].replaceAll(' ', '');
                            let value = attributeValuePair.split('=')[1].trim();

                            result.setAttribute(attribute, value);
                        }
                    }

                    changeFile = true;
                    break;

                case "Append to Attribute":
                    const attributeNameForAppend: string = replaceText.split(',')[0];
                    const valuesToAppend : string[] = replaceText.replace(/"|'/g, '').split(',').slice(1).map(value => {
                        return value.trim();
                    });
                    
                    for (let result of results){
                        const oldValue: string = result.getAttribute(attributeNameForAppend);

                        if (oldValue !== null){
                            const newValue: string = oldValue + ' ' + valuesToAppend.join(' ');
                          
                            result.setAttribute(attributeNameForAppend, newValue);
                            changeFile = true;
                        }
                    }

                    break;

                case "Change Tag Name":
                    const newTagName = replaceText.replaceAll(' ', '');
                    const { document } = (new jsdom.JSDOM()).window;

                    for (let result of results){
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
                    }

                    changeFile = true;
                    break;

                case "Add Upper Tag":
                    const parentInfo = replaceText.replaceAll(' ', '');

                    for (let result of results){
                        const newParent = createElementFromSelector(parentInfo);
                        result.parentNode.insertBefore(newParent, result);
                        newParent.appendChild(result);
                    }

                    changeFile = true;
                    break;

                case "Remove Tag":
                    for(let result of results){
                        result.remove();
                    }

                    changeFile = true;
                    break;
                    
                case "Remove from Class":
                    const classNamesToRemove = replaceText.trim().split(' ');

                    for (let result of results){
                        for (let className of classNamesToRemove) {
                            //Remove spaces if classNames seperated with more than one white space char
                            className = className.trim();
                            if (result.classList.contains(className)) {
                                result.classList.remove(className);
                            }
                        }
                    }

                    changeFile = true;
                    break;

                case "Remove from Attribute":
                    const attributeNameForRemove: string = replaceText.split(',')[0];
                    const valuesToRemove : string[] = replaceText.replace(/"|'/g, '').split(',').slice(1).map(value => {
                        return value.trim();
                    });

                    for(let result of results){
                        const oldValue: string = result.getAttribute(attributeNameForRemove);
                        
                        if (oldValue !== null){
                            let newValue = oldValue;

                            for(let value of valuesToRemove){
                                newValue = newValue.replace(new RegExp(`(?:^|[\\W])${value}`,'g'),'');
                            }

                            result.setAttribute(attributeNameForRemove, newValue.trim());
                            changeFile = true;
                        }
                    }
                    
                    break;

                case "Remove Attribute":
                    replaceText = replaceText.trim().replaceAll(' ', '');
                    const attributesToRemove: string[] = replaceText.split(',');

                    for(let result of results){
                        for (let attribute of attributesToRemove) {
                            if (result.hasAttribute) {
                                result.removeAttribute(attribute);
                            }
                        }
                    }

                    changeFile = true;
                    break;

                case "Remove Upper Tag":
                    for (let result of results){
                        if (result.parentElement === null) {
                            throw new Error(`${result.tagName.toLowerCase()} tag does not have an upper tag`);
                        }

                        //Remove any upper tag except HTML, HEAD and BODY tags
                        if (result.parentElement.tagName !== "HTML" && result.parentElement.tagName !== "HEAD" && result.parentElement.tagName !== "BODY") {
                            result.parentElement.replaceWith(...result.parentElement.childNodes);
                            changeFile = true;
                        }
                    }

                    break;
            }
        }
        else {
            searchMessage = searchResult;
        }

        if (changeFile) {
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