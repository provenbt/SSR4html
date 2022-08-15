'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUpperTag = void 0;
function removeUpperTag(editor, document) {
    let highlightedText = document.getText(editor.selection);
    let seperateTags = highlightedText.split('>');
    let upperTagRemoved = seperateTags.slice(1, seperateTags.length - 2);
    let removedTagText = upperTagRemoved.join('>');
    removedTagText += '>';
    editor.edit((editBuilder) => {
        editor.selections.forEach((sel) => {
            const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
            editBuilder.replace(range, removedTagText);
        });
    });
}
exports.removeUpperTag = removeUpperTag;
//# sourceMappingURL=removeUpperTag.js.map