import * as vscode from 'vscode';

export function replaceInAllFiles(results: any[], choice: string, replaceText: string, file: any, dom: any):string {
    const pretty = require('pretty');
    let processResult = "Success";

    results.forEach((result : any)=> {
        switch (choice) {
            case "setClass":
                result.className = replaceText.trim();
                break;
            case "setAttribute":
                try {
                    const re = /[A-Za-z]+\s*=\s*[A-Za-z0-9]+/g;
                    if (replaceText.match(re) === null){
                        throw new Error("Attribute format is not acceptable");
                    }
                    const attributeValuePair = replaceText.replaceAll(/"|'/g, '').split('=');
                    result.setAttribute(attributeValuePair[0].trim().replaceAll(' ',''), attributeValuePair[1].trim().replaceAll(' ', '-'));
                } catch (error) {
                    console.log(error);
                    processResult = "SAerror";
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
                } catch (error) {
                    console.log(error);
                    processResult = "CTerror";
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
                        throw new Error("Missing attribute name");
                    }
                    result.removeAttribute(replaceText);
                } catch (error) {
                    console.log(error);
                    processResult = "RAerror";
                }
                break;
          }
    });

    try {
        vscode.workspace.fs.writeFile(file, new TextEncoder().encode(pretty(dom.serialize(), {ocd: true})));
    } catch (error) {
        console.log(error);
        processResult = "WFerror";
    }

    return processResult;
}