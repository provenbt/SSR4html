"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vsCodeButton = exports.Button = void 0;
const fast_element_1 = require("@microsoft/fast-element");
const fast_foundation_1 = require("@microsoft/fast-foundation");
const button_styles_1 = require("./button.styles");
/**
 * The Visual Studio Code button class.
 *
 * @public
 */
class Button extends fast_foundation_1.Button {
    /**
     * Component lifecycle method that runs when the component is inserted
     * into the DOM.
     *
     * @internal
     */
    connectedCallback() {
        super.connectedCallback();
        // If the appearance property has not been set, set it to the
        // value of the appearance attribute.
        if (!this.appearance) {
            const appearanceValue = this.getAttribute('appearance');
            this.appearance = appearanceValue;
        }
    }
    /**
     * Component lifecycle method that runs when an attribute of the
     * element is changed.
     *
     * @param attrName - The attribute that was changed
     * @param oldVal - The old value of the attribute
     * @param newVal - The new value of the attribute
     *
     * @internal
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        // In the case when an icon only button is created add a default ARIA
        // label to the button since there is no longer button text to use
        // as the label
        if (attrName === 'appearance' && newVal === 'icon') {
            // Only set the ARIA label to the default text if an aria-label attribute
            // does not exist on the button
            const ariaLabelValue = this.getAttribute('aria-label');
            if (!ariaLabelValue) {
                this.ariaLabel = 'Icon Button';
            }
        }
        // In the case when the aria-label attribute has been defined on the
        // <vscode-button>, this will programmatically propogate the value to
        // the <button> HTML element that lives in the Shadow DOM
        if (attrName === 'aria-label') {
            this.ariaLabel = newVal;
        }
        if (attrName === 'disabled') {
            this.disabled = newVal !== null;
        }
    }
}
__decorate([
    fast_element_1.attr
], Button.prototype, "appearance", void 0);
exports.Button = Button;
/**
 * The Visual Studio Code button component registration.
 *
 * @remarks
 * HTML Element: `<vscode-button>`
 *
 * @public
 */
exports.vsCodeButton = Button.compose({
    baseName: 'button',
    template: fast_foundation_1.buttonTemplate,
    styles: button_styles_1.buttonStyles,
    shadowOptions: {
        delegatesFocus: true,
    },
});
//# sourceMappingURL=index.js.map