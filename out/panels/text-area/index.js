"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.vsCodeTextArea = exports.TextArea = exports.TextAreaResize = void 0;
const fast_foundation_1 = require("@microsoft/fast-foundation");
Object.defineProperty(exports, "TextAreaResize", { enumerable: true, get: function () { return fast_foundation_1.TextAreaResize; } });
const text_area_styles_1 = require("./text-area.styles");
/**
 * The Visual Studio Code text area class.
 *
 * @remarks
 * HTML Element: `<vscode-text-area>`
 *
 * @public
 */
class TextArea extends fast_foundation_1.TextArea {
    /**
     * Component lifecycle method that runs when the component is inserted
     * into the DOM.
     *
     * @internal
     */
    connectedCallback() {
        super.connectedCallback();
        if (this.textContent) {
            this.setAttribute('aria-label', this.textContent);
        }
        else {
            // Describe the generic component if no label is provided
            this.setAttribute('aria-label', 'Text area');
        }
    }
}
exports.TextArea = TextArea;
/**
 * The Visual Studio Code text area component registration.
 *
 * @remarks
 * HTML Element: `<vscode-text-area>`
 *
 * @public
 */
exports.vsCodeTextArea = TextArea.compose({
    baseName: 'text-area',
    template: fast_foundation_1.textAreaTemplate,
    styles: text_area_styles_1.textAreaStyles,
    shadowOptions: {
        delegatesFocus: true,
    },
});
//# sourceMappingURL=index.js.map