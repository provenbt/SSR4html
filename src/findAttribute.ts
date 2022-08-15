'use strict';
import {Selection} from 'vscode';

export  function findAttribute(attributeValue : string, text : string, editor : any) : any {
    let foundSelections : any = [];

    let matches = [...text.matchAll(new RegExp(`[^</]${attributeValue}[^.*]`, "gm"))];
			matches.forEach((match, index) => {
			let startPos = editor.document.positionAt(Number(match.index) + 1);
			let endPos = editor.document.positionAt(Number(match.index) + match[0].length-1);
			foundSelections[index] = new Selection(startPos, endPos);
		});
        
    return foundSelections;
}