"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithResizeHorizontal = exports.WithResizeVertical = exports.WithResizeBoth = exports.WithResizeNone = exports.WithDisabled = exports.WithReadonly = exports.WithMaxLength = exports.WithCustomRows = exports.WithCustomCols = exports.WithAutofocus = exports.WithPlaceholder = exports.Default = void 0;
const createTextArea_1 = require("./fixtures/createTextArea");
exports.default = {
    title: 'Library/Text Area',
    argTypes: {
        label: { control: 'text' },
        placeholder: { control: 'text' },
        value: { control: 'text' },
        resize: {
            control: {
                type: 'select',
                options: ['None', 'Both', 'Horizontal', 'Vertical'],
            },
        },
        cols: { control: 'number' },
        rows: { control: 'number' },
        maxLength: { control: 'number' },
        isReadOnly: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        isAutoFocused: { control: 'boolean' },
    },
    parameters: {
        actions: {
            disabled: true,
        },
    },
};
const Template = ({ ...args }) => {
    return (0, createTextArea_1.createTextArea)({ ...args });
};
exports.Default = Template.bind({});
exports.Default.args = {
    label: 'Text Area Label',
    placeholder: '',
    resize: 'None',
    value: '',
    cols: '',
    rows: '',
    maxLength: '',
    isReadOnly: false,
    isDisabled: false,
    isAutoFocused: false,
};
exports.Default.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area>Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithPlaceholder = Template.bind({});
exports.WithPlaceholder.args = {
    ...exports.Default.args,
    placeholder: 'Placeholder Text',
};
exports.WithPlaceholder.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area placeholder="Placeholder Text">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithAutofocus = Template.bind({});
exports.WithAutofocus.args = {
    ...exports.Default.args,
    isAutoFocused: true,
};
exports.WithAutofocus.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area autofocus>Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithCustomCols = Template.bind({});
exports.WithCustomCols.args = {
    ...exports.Default.args,
    placeholder: 'This text area is 50 characters in width',
    cols: 50,
};
exports.WithCustomCols.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area cols="50">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithCustomRows = Template.bind({});
exports.WithCustomRows.args = {
    ...exports.Default.args,
    placeholder: 'This text area is 20 characters in height',
    rows: 20,
};
exports.WithCustomRows.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area rows="20">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithMaxLength = Template.bind({});
exports.WithMaxLength.args = {
    ...exports.Default.args,
    placeholder: 'This text area can only contain a maximum of 10 characters',
    maxLength: 10,
};
exports.WithMaxLength.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area maxlength="10">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithReadonly = Template.bind({});
exports.WithReadonly.args = {
    ...exports.Default.args,
    placeholder: 'This text is read only',
    isReadOnly: true,
};
exports.WithReadonly.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area readonly>Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithDisabled = Template.bind({});
exports.WithDisabled.args = {
    ...exports.Default.args,
    placeholder: 'This text area cannot be interacted with',
    isDisabled: true,
};
exports.WithDisabled.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area disabled>Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithResizeNone = Template.bind({});
exports.WithResizeNone.args = {
    ...exports.Default.args,
    placeholder: 'This text area cannot be resized',
    resize: 'None',
};
exports.WithResizeNone.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area resize="none">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithResizeBoth = Template.bind({});
exports.WithResizeBoth.args = {
    ...exports.Default.args,
    placeholder: 'This text area can be resized both vertically and horizontally',
    resize: 'Both',
};
exports.WithResizeBoth.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area resize="both">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithResizeVertical = Template.bind({});
exports.WithResizeVertical.args = {
    ...exports.Default.args,
    placeholder: 'This text area can be resized vertically',
    resize: 'Vertical',
};
exports.WithResizeVertical.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area resize="vertical">Text Area Label</vscode-text-area>`,
        },
    },
};
exports.WithResizeHorizontal = Template.bind({});
exports.WithResizeHorizontal.args = {
    ...exports.Default.args,
    placeholder: 'This text area can be resized horizontally',
    resize: 'Horizontal',
};
exports.WithResizeHorizontal.parameters = {
    docs: {
        source: {
            code: `<vscode-text-area resize="horizontal">Text Area Label</vscode-text-area>`,
        },
    },
};
//# sourceMappingURL=text-area.stories.js.map