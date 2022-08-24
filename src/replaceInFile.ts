import * as vscode from 'vscode';

export function replaceInFile(results: any[], choice: string, replaceText: string, file: any, dom: any) {
    const pretty = require('pretty');
    let processResult = "Success";

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
                    //TODO
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