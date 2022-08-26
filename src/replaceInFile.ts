import * as vscode from 'vscode';

export function replaceInFile(results: any[], choice: string, replaceText: string, file: any, dom: any) {
    const pretty = require('pretty');
    let processResult = "Success";
    const jsdom = require("jsdom");

    results.forEach((result : any)=> {
        switch (choice) {
            case "setClass":
                try {
                    const re = /[A-Za-z]+.*/g;
                    if (replaceText.match(re) === null){
                        throw new Error("Invalid class name format");
                    }
                    result.className = replaceText.trim();  
                } catch (error: any) {
                    console.log(error);
                    processResult = error.message;
                }
                break;
            case "setAttribute":
                try {
                    const re = /[A-Za-z]+\s*=\s*[A-Za-z0-9]+/g;
                    if (replaceText.match(re) === null){
                        throw new Error("Invalid attribute-value format");
                    }
                    const attributeValuePair = replaceText.replaceAll(/"|'/g, '').split('=');
                    result.setAttribute(attributeValuePair[0].trim().replaceAll(' ',''), attributeValuePair[1].trim().replaceAll(' ', '-'));
                } catch (error: any) {
                    console.log(error);
                    processResult = error.message;
                }
                break;
            case "changeTag":
                try {
                    const newTagName = replaceText.trim().replaceAll(' ','');
                    const re = /[A-Za-z]+/g;
                    if (newTagName.match(re) === null){
                        throw new Error("Invalid tag format");
                    }

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
                    for (let name of attributeNames){
                        let value = result.getAttributeNode(name).value;
                        newElem.setAttribute(name, value);
                    }
                    // Replace the source element with the new element on the page 
                    result.parentNode.replaceChild(newElem, result); 
                } catch (error: any) {
                    console.log(error);
                    processResult = error.message;
                }
                break;
            case "removeTag":
                result.remove();
                break;
            case "removeAttribute":
                try {
                    const re = /^[A-Za-z]+$/g;
                    replaceText = replaceText.trim().replaceAll(' ', '');
                    if (replaceText.match(re) === null){
                        throw new Error("Invalid attribute name format");
                    }
                    if (!result.hasAttribute(replaceText)){
                        throw new Error(`Element does not have "${replaceText}" attribute`);
                    }
                    result.removeAttribute(replaceText);
                } catch (error: any) {
                    console.log(error);
                    processResult = error.message;
                }
                break;
          }
    });

    try {
        vscode.workspace.fs.writeFile(file, new TextEncoder().encode(pretty(dom.serialize(), {ocd: true})));
    } catch (error: any) {
        console.log(error);
        processResult = error.message;
    }

    return processResult;
}