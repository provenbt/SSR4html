"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.vsCodeCheckbox = exports.Checkbox = void 0;
const fast_foundation_1 = require("@microsoft/fast-foundation");
const checkbox_styles_1 = require("./checkbox.styles");
/**
 * The Visual Studio Code checkbox class.
 *
 * @public
 */
class Checkbox extends fast_foundation_1.Checkbox {
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
            // Fallback to the label if there is no text content
            this.setAttribute('aria-label', 'Checkbox');
        }
    }
}
exports.Checkbox = Checkbox;
/**
 * The Visual Studio Code checkbox component registration.
 *
 * @remarks
 * HTML Element: `<vscode-checkbox>`
 *
 * @public
 */
exports.vsCodeCheckbox = Checkbox.compose({
    baseName: 'checkbox',
    template: fast_foundation_1.checkboxTemplate,
    styles: checkbox_styles_1.checkboxStyles,
    checkedIndicator: `
		<svg 
			part="checked-indicator"
			class="checked-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
			/>
		</svg>
	`,
    indeterminateIndicator: `
		<div part="indeterminate-indicator" class="indeterminate-indicator"></div>
	`,
});
//# sourceMappingURL=index.js.map