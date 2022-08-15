'use strict';
import {Selection} from 'vscode';

export  function findTag(tag : string, text : string, editor : any) : any {
    let foundSelections : any = [];

    let matches = [...text.matchAll(new RegExp(`</?${tag}`, "gm"))];
			matches.forEach((match, index) => {
			let startPos = editor.document.positionAt(match[0][1] === '/' ? Number(match.index)+2 : Number(match.index)+1);
			let endPos = editor.document.positionAt(Number(match.index) + match[0].length);
			foundSelections[index] = new Selection(startPos, endPos);
		});
        
    return foundSelections;
}