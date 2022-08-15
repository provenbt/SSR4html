'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAttribute = void 0;
const vscode_1 = require("vscode");
function findAttribute(attributeValue, text, editor) {
    let foundSelections = [];
    let matches = [...text.matchAll(new RegExp(`[^</]${attributeValue}[^.*]`, "gm"))];
    matches.forEach((match, index) => {
        let startPos = editor.document.positionAt(Number(match.index) + 1);
        let endPos = editor.document.positionAt(Number(match.index) + match[0].length - 1);
        foundSelections[index] = new vscode_1.Selection(startPos, endPos);
    });
    return foundSelections;
}
exports.findAttribute = findAttribute;
//# sourceMappingURL=findAttribute.js.map