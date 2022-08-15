'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTag = void 0;
const vscode_1 = require("vscode");
function findTag(tag, text, editor) {
    let foundSelections = [];
    let matches = [...text.matchAll(new RegExp(`</?${tag}`, "gm"))];
    matches.forEach((match, index) => {
        let startPos = editor.document.positionAt(match[0][1] === '/' ? Number(match.index) + 2 : Number(match.index) + 1);
        let endPos = editor.document.positionAt(Number(match.index) + match[0].length);
        foundSelections[index] = new vscode_1.Selection(startPos, endPos);
    });
    return foundSelections;
}
exports.findTag = findTag;
//# sourceMappingURL=findTags.js.map