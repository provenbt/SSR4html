import * as vscode from 'vscode';
import { createElementFromSelector } from './createElementFromSelector';
const pretty = require('pretty');
const jsdom = require("jsdom");

export async function replaceInFile(file: vscode.Uri, choice: string, searchText: string, replaceText: string, fileList: vscode.Uri[], rawContents: Uint8Array[]) {
    let processResult: string;

    try {
        let changeFile: boolean = false;

        const rawContent = await vscode.workspace.fs.readFile(file);
        const htmlText = new TextDecoder().decode(rawContent);

        const dom = new jsdom.JSDOM(htmlText);
        const results = dom.window.document.querySelectorAll(searchText);

        switch (choice) {
            case "Set Class":
                const className = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== "")).join(' ');

                for (let result of results) {
                    result.className = className;
                }

                changeFile = true;
                break;

            case "Append to Class":
                const classNamesToAppend = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

                for (let result of results) {
                    if (result.hasAttribute("class")) {
                        for (let className of classNamesToAppend) {
                            // Append a classname if the name does not exist in the classname
                            if (!(result.classList.contains(className))) {
                                result.classList.add(className);
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Set Id":
                const id = replaceText.trim();

                for (let result of results) {
                    result.id = id;
                }

                changeFile = true;
                break;

            case "Set Attribute":
                const attributeValuePairs: string[] = replaceText.replace(/"|'/g, '').split(',');

                for (let result of results) {
                    for (let attributeValuePair of attributeValuePairs) {
                        // Remove all kind of space character in the attribute name
                        let attribute = attributeValuePair.split('=')[0].replaceAll(' ', '');
                        let value = attributeValuePair.split('=')[1].trim();

                        result.setAttribute(attribute, value);
                    }
                }

                changeFile = true;
                break;

            case "Append to Attribute":
                const attributeNameForAppend: string = replaceText.split(',')[0].trim();
                const valuesToAppend: string[] = replaceText.replace(/"|'/g, '').split(',').slice(1).map(v => (v.trim()));

                for (let result of results) {
                    const oldValue: string = result.getAttribute(attributeNameForAppend);

                    if (oldValue !== null) {
                        let newValue = oldValue;
                        // Seperate each attribute value
                        const oldValues = oldValue.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

                        // Append a value if the value do not already exists in the attribute
                        for (let value of valuesToAppend) {
                            if (!(oldValues.includes(value))) {
                                newValue = !(oldValue.endsWith(' ')) ? newValue + ' ' + value : newValue + value;
                                result.setAttribute(attributeNameForAppend, newValue);
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Set Style Property":
                const propertiesInfoForSet = replaceText.split(',');

                for (let result of results) {
                    // Overwrite style attribute if it is already defined in the element
                    if (result.hasAttribute("style")) {
                        result.removeAttribute("style");
                    }

                    const propertiesAndValues = propertiesInfoForSet.map(v => (v.split(':').map(a => (a.trim()))));
                    for (let propertyAndValue of propertiesAndValues) {
                        // Change null(string value) with empty string value to delete the property
                        if (propertyAndValue[1] === "null") {
                            propertyAndValue[1] = "";
                        }

                        result.style.setProperty(propertyAndValue[0], propertyAndValue[1]);
                    }
                }

                changeFile = true;
                break;

            case "Edit Style Property":
                const propertiesInfoForEdit = replaceText.split(',');

                for (let result of results) {
                    if (result.hasAttribute("style")) {
                        const propertiesAndValues = propertiesInfoForEdit.map(v => (v.split(':').map(a => (a.trim()))));

                        for (let propertyAndValue of propertiesAndValues) {
                            // Change null(string value) with empty string value to delete the property
                            if (propertyAndValue[1] === "null") {
                                propertyAndValue[1] = "";
                            }
                            // Append a property if it has a different value
                            if (result.style.getPropertyValue(propertyAndValue[0]) !== propertyAndValue[1]) {
                                result.style.setProperty(propertyAndValue[0], propertyAndValue[1]);
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Change Tag Name":
                const newTagName = replaceText.replaceAll(' ', '');
                const { document } = (new jsdom.JSDOM()).window;

                for (let result of results) {
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

                for (let result of results) {
                    // Create HTML element that will be upper tag
                    const newParent = createElementFromSelector(parentInfo);
                    // Insert before the matched node(result)
                    result.parentNode.insertBefore(newParent, result);
                    // Append the matched node(result) as the child of the created HTML element
                    newParent.appendChild(result);
                }

                changeFile = true;
                break;

            case "Remove Tag":
                for (let result of results) {
                    result.remove();
                }

                changeFile = true;
                break;

            case "Remove from Class":
                const classNamesToRemove = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

                for (let result of results) {
                    if (result.hasAttribute("class")) {
                        for (let className of classNamesToRemove) {
                            // Remove a classname if the name really exists in the classname
                            if (result.classList.contains(className)) {
                                result.classList.remove(className);
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Remove from Attribute":
                const attributeNameForRemove: string = replaceText.split(',')[0].trim();
                const valuesToRemove: string[] = replaceText.replace(/"|'/g, '').split(',').slice(1).map(v => (v.trim()));

                for (let result of results) {
                    const oldValue: string = result.getAttribute(attributeNameForRemove);

                    if (oldValue !== null) {
                        let newValue = oldValue;
                        // Seperate each attribute value
                        const oldValues = oldValue.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

                        // Remove a value if the value really exists in the attribute
                        for (let value of valuesToRemove) {
                            if (oldValues.includes(value)) {
                                newValue = newValue.replace(new RegExp(`(?:^|[\\W])${value}`, 'g'), '').trim();
                                result.setAttribute(attributeNameForRemove, newValue);
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Remove Attribute":
                replaceText = replaceText.trim();
                const attributesToRemove: string[] = replaceText.split(',').map(value => (value.trim()));

                for (let result of results) {
                    for (let attribute of attributesToRemove) {
                        // Remove only existing attributes in the element
                        if (result.hasAttribute(attribute)) {
                            result.removeAttribute(attribute);
                            changeFile = true;
                        }
                    }
                }

                break;

            case "Remove Upper Tag":
                for (let result of results) {
                    if (result.parentElement === null) {
                        throw new Error(`${result.tagName.toLowerCase()} tag doesn't have an upper tag`);
                    }

                    //Remove any upper tag except HTML, HEAD and BODY tags
                    if (result.parentElement.tagName !== "HTML" && result.parentElement.tagName !== "HEAD" && result.parentElement.tagName !== "BODY") {
                        result.parentElement.replaceWith(...result.parentElement.childNodes);
                        changeFile = true;
                    }
                }

                break;

            default:
                throw new Error("Undefined Operation");
        }

        if (changeFile) {
            // Store the old state of the file 
            rawContents.push(rawContent);
            fileList.push(file);
            // Overwrite the manipulated version of the file
            await vscode.workspace.fs.writeFile(file, new TextEncoder().encode(pretty(dom.serialize(), { ocd: true })));
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