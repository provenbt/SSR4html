"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckbox = void 0;
const index_1 = require("../index");
const index_2 = require("../../utilities/storybook/index");
function createCheckbox({ label, isChecked, isIndeterminate, isDisabled, isAutoFocused, isReadOnly, hasValue, onChange, }) {
    const checkbox = new index_1.Checkbox();
    if (label) {
        checkbox.textContent = label;
    }
    if (isChecked) {
        checkbox.setAttribute('checked', isChecked.toString());
    }
    if (isIndeterminate) {
        checkbox.indeterminate = isIndeterminate;
    }
    if (isDisabled) {
        checkbox.setAttribute('disabled', '');
    }
    if (isAutoFocused) {
        checkbox.setAttribute('autofocus', '');
        // Focus observer will force focus if checkbox focus is lost after page load
        (0, index_2.focusObserver)(checkbox);
    }
    if (isReadOnly) {
        checkbox.setAttribute('readonly', '');
    }
    if (hasValue) {
        checkbox.setAttribute('value', 'baz');
    }
    checkbox.addEventListener('change', onChange);
    return checkbox;
}
exports.createCheckbox = createCheckbox;
//# sourceMappingURL=createCheckbox.js.map