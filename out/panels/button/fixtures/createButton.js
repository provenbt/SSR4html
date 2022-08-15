"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createButton = void 0;
const index_1 = require("../index");
const index_2 = require("../../utilities/storybook/index");
function createButton({ label, appearance, isDisabled, isAutoFocused, startIcon, iconOnly, ariaLabel, onClick, }) {
    const button = new index_1.Button();
    if (label && !iconOnly) {
        button.textContent = label;
    }
    if (appearance) {
        button.setAttribute('appearance', appearance.toLowerCase());
    }
    if (isDisabled) {
        button.setAttribute('disabled', '');
    }
    if (isAutoFocused) {
        button.setAttribute('autofocus', '');
        // Focus observer will force focus if button focus is lost after page load
        (0, index_2.focusObserver)(button);
    }
    if (startIcon) {
        const start = (0, index_2.createCodiconIcon)({
            iconName: 'add',
            slotName: 'start',
        });
        button.appendChild(start);
    }
    if (iconOnly) {
        const icon = (0, index_2.createCodiconIcon)({ iconName: 'check' });
        button.appendChild(icon);
        button.setAttribute('aria-label', ariaLabel);
    }
    button.addEventListener('click', onClick);
    return button;
}
exports.createButton = createButton;
//# sourceMappingURL=createButton.js.map