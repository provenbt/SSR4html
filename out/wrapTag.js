'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapTag = void 0;
function wrapTag(editor, document, upperTag) {
    editor.edit((editBuilder) => {
        editor.selections.forEach((sel) => {
            const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
            let highlightedText = document.getText(editor.selection);
            let wrappedText = `<${upperTag}>${highlightedText}</${upperTag}>`;
            editBuilder.replace(range, wrappedText);
        });
    });
}
exports.wrapTag = wrapTag;
//# sourceMappingURL=wrapTag.js.map