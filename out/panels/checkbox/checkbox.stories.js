"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithValue = exports.WithReadOnly = exports.WithDisabled = exports.WithAutoFocus = exports.WithIndeterminate = exports.WithChecked = exports.Default = void 0;
const addon_actions_1 = require("@storybook/addon-actions");
const createCheckbox_1 = require("./fixtures/createCheckbox");
exports.default = {
    title: 'Library/Checkbox',
    argTypes: {
        label: { control: 'text' },
        isChecked: { control: 'boolean' },
        isIndeterminate: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        isAutoFocused: { control: 'boolean' },
        isReadOnly: { control: 'boolean' },
        hasValue: { control: 'boolean' },
        indicatorIcon: { control: 'boolean' },
        onChange: {
            action: 'changed',
            table: {
                disable: true,
            },
        },
    },
};
const Template = ({ ...args }) => {
    return (0, createCheckbox_1.createCheckbox)({ ...args });
};
exports.Default = Template.bind({});
exports.Default.args = {
    label: 'Label',
    isChecked: false,
    isIndeterminate: false,
    isDisabled: false,
    isAutoFocused: false,
    isReadOnly: false,
    hasValue: false,
    indicatorIcon: false,
    onChange: (0, addon_actions_1.action)('checkbox-onchange'),
};
exports.Default.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox>Label</vscode-checkbox>`,
        },
    },
};
exports.WithChecked = Template.bind({});
exports.WithChecked.args = {
    ...exports.Default.args,
    isChecked: true,
};
exports.WithChecked.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox checked>Label</vscode-checkbox>`,
        },
    },
};
exports.WithIndeterminate = Template.bind({});
exports.WithIndeterminate.args = {
    ...exports.Default.args,
    isIndeterminate: true,
};
exports.WithIndeterminate.parameters = {
    docs: {
        source: {
            code: `// JavaScript\n\nconst checkbox = document.getElementById("baz");\ncheckbox.indeterminate = true;\n\n<!-- HTML -->\n\n<vscode-checkbox id="baz">Label</vscode-checkbox>`,
        },
    },
};
exports.WithAutoFocus = Template.bind({});
exports.WithAutoFocus.args = {
    ...exports.Default.args,
    isAutoFocused: true,
};
exports.WithAutoFocus.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox autofocus>Label</vscode-checkbox>`,
        },
    },
};
exports.WithDisabled = Template.bind({});
exports.WithDisabled.args = {
    ...exports.Default.args,
    isDisabled: true,
};
exports.WithDisabled.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox disabled>Label</vscode-checkbox>`,
        },
    },
};
exports.WithReadOnly = Template.bind({});
exports.WithReadOnly.args = {
    ...exports.Default.args,
    isReadOnly: true,
};
exports.WithReadOnly.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox readonly>Label</vscode-checkbox>`,
        },
    },
};
exports.WithValue = Template.bind({});
exports.WithValue.args = {
    ...exports.Default.args,
    hasValue: true,
};
exports.WithValue.parameters = {
    docs: {
        source: {
            code: `<vscode-checkbox value="baz">Label</vscode-checkbox>`,
        },
    },
};
//# sourceMappingURL=checkbox.stories.js.map