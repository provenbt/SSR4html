'use strict';

export  function removeUpperTag(editor : any, document : any) : any {

    let highlightedText = document.getText(editor.selection);

	let seperateTags : string [] = highlightedText.split('>');
	let upperTagRemoved : string [] = seperateTags.slice(1,seperateTags.length-2);
	let removedTagText = upperTagRemoved.join('>');
	removedTagText += '>';
				
	editor.edit((editBuilder: any) => {
		editor.selections.forEach((sel: { isEmpty: any; start: any; }) => {
			const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
			editBuilder.replace(range, removedTagText);
		});
	});
}