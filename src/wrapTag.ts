'use strict';

export  function wrapTag(editor : any, document : any, upperTag : any) : any {

    editor.edit((editBuilder: any) => {
        editor.selections.forEach((sel: { isEmpty: any; start: any; }) => {
            const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
            let highlightedText = document.getText(editor.selection);
            let wrappedText = `<${upperTag}>${highlightedText}</${upperTag}>`;
            editBuilder.replace(range, wrappedText);
        });
    });
}