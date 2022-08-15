"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithIconOnly = exports.WithStartIcon = exports.WithDisabled = exports.WithAutofocus = exports.Secondary = exports.Default = void 0;
const addon_actions_1 = require("@storybook/addon-actions");
const createButton_1 = require("./fixtures/createButton");
exports.default = {
    title: 'Library/Button',
    argTypes: {
        label: { control: 'text' },
        appearance: {
            control: {
                type: 'select',
                options: ['Primary', 'Secondary', 'Icon'],
            },
        },
        isDisabled: { control: 'boolean' },
        isAutoFocused: { control: 'boolean' },
        startIcon: { control: 'boolean' },
        iconOnly: { control: 'boolean' },
        ariaLabel: { control: 'text' },
        onClick: {
            action: 'clicked',
            table: {
                disable: true,
            },
        },
    },
};
const Template = ({ ...args }) => {
    return (0, createButton_1.createButton)({ ...args });
};
exports.Default = Template.bind({});
exports.Default.args = {
    label: 'Button Text',
    appearance: 'Primary',
    isDisabled: false,
    isAutoFocused: false,
    startIcon: false,
    iconOnly: false,
    onClick: (0, addon_actions_1.action)('button-clicked'),
};
exports.Default.parameters = {
    docs: {
        source: {
            code: `<vscode-button>Button Text</vscode-button>`,
        },
    },
};
exports.Secondary = Template.bind({});
exports.Secondary.args = {
    ...exports.Default.args,
    appearance: 'Secondary',
};
exports.Secondary.parameters = {
    docs: {
        source: {
            code: `<vscode-button appearance="secondary">Button Text</vscode-button>`,
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
            code: `<vscode-button autofocus>Button Text</vscode-button>`,
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
            code: `<vscode-button disabled>Button Text</vscode-button>`,
        },
    },
};
exports.WithStartIcon = Template.bind({});
exports.WithStartIcon.args = {
    ...exports.Default.args,
    startIcon: true,
};
exports.WithStartIcon.parameters = {
    docs: {
        source: {
            code: `<!-- Note: Using Visual Studio Code Codicon Library -->\n\n<vscode-button>\n\tButton Text\n\t<span slot="start" class="codicon codicon-add"></span>\n</vscode-button>`,
        },
    },
};
exports.WithIconOnly = Template.bind({});
exports.WithIconOnly.args = {
    ...exports.Default.args,
    appearance: 'Icon',
    iconOnly: true,
    ariaLabel: 'Confirm',
};
exports.WithIconOnly.parameters = {
    docs: {
        source: {
            code: `<!-- Note: Using Visual Studio Code Codicon Library -->\n\n<vscode-button appearance="icon" aria-label="Confirm">\n\t<span class="codicon codicon-check"></span>\n</vscode-button>`,
        },
    },
};
//# sourceMappingURL=button.stories.js.map