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
                const attributeNameAndValuesForSet = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");
                const attributeNameForSet: string = attributeNameAndValuesForSet[0];
                const valuesToSet: string[] = attributeNameAndValuesForSet.slice(1);

                for (let result of results) {
                    result.setAttribute(attributeNameForSet, valuesToSet.join(' '));
                }

                changeFile = true;
                break;

            case "Append to Attribute":
                const attributeNameAndValuesForAppend = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");
                const attributeNameForAppend: string = attributeNameAndValuesForAppend[0];
                const valuesToAppend: string[] = attributeNameAndValuesForAppend.slice(1);

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
                const propertiesInfoForSet = replaceText.split(',').map(v => v.trim()).filter(e => e !== "");

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
                const propertiesInfoForEdit = replaceText.split(',').map(v => v.trim()).filter(e => e !== "");

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
                const newTagName = replaceText.trim();
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
                const parentInfo = replaceText.trim();

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
                const attributeNameAndValuesForRemove = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");
                const attributeNameForRemove: string = attributeNameAndValuesForRemove[0];
                const valuesToRemove: string[] = attributeNameAndValuesForRemove.slice(1);

                for (let result of results) {
                    const oldValue: string = result.getAttribute(attributeNameForRemove);

                    if (oldValue !== null) {
                        let newValue = oldValue;
                        // Seperate each attribute value
                        const oldValues = oldValue.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

                        // Remove a value if the value really exists in the attribute
                        for (let value of valuesToRemove) {
                            if (oldValues.includes(value)) {
                                newValue = newValue.replace(new RegExp(`(?:^|[\\s])${value}(?:$|[\\s])`, 'g'), ' ');
                                result.setAttribute(attributeNameForRemove, newValue.trim());
                                changeFile = true;
                            }
                        }
                    }
                }

                break;

            case "Remove Attribute":
                const attributesToRemove: string[] = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");

                for (let result of results) {
                    for (let attributeName of attributesToRemove) {
                        // Remove only exist attributes in the element
                        if (result.hasAttribute(attributeName)) {
                            result.removeAttribute(attributeName);
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