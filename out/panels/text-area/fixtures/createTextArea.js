"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextArea = void 0;
const index_1 = require("../index");
function createTextArea({ label, placeholder, value, resize, cols, rows, maxLength, isReadOnly, isDisabled, isAutoFocused, }) {
    const textArea = new index_1.TextArea();
    if (label) {
        textArea.textContent = label;
    }
    if (placeholder) {
        textArea.setAttribute('placeholder', placeholder);
    }
    if (value) {
        textArea.value = value;
    }
    if (resize) {
        textArea.setAttribute('resize', resize.toLowerCase());
    }
    if (cols) {
        textArea.setAttribute('cols', cols.toString());
    }
    if (rows) {
        textArea.setAttribute('rows', rows.toString());
    }
    if (maxLength) {
        textArea.setAttribute('maxlength', maxLength.toString());
    }
    if (isReadOnly) {
        textArea.setAttribute('readonly', '');
    }
    if (isDisabled) {
        textArea.setAttribute('disabled', '');
    }
    if (isAutoFocused) {
        textArea.setAttribute('autofocus', '');
    }
    return textArea;
}
exports.createTextArea = createTextArea;
//# sourceMappingURL=createTextArea.js.map