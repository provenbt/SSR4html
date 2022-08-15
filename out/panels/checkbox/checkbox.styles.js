"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkboxStyles = void 0;
const fast_element_1 = require("@microsoft/fast-element");
const fast_foundation_1 = require("@microsoft/fast-foundation");
const design_tokens_1 = require("../design-tokens");
const checkboxStyles = (context, defintiion) => (0, fast_element_1.css) `
	${(0, fast_foundation_1.display)('inline-flex')} :host {
		align-items: center;
		outline: none;
		margin: calc(${design_tokens_1.designUnit} * 1px) 0;
		user-select: none;
		font-size: ${design_tokens_1.typeRampBaseFontSize};
		line-height: ${design_tokens_1.typeRampBaseLineHeight};
	}
	.control {
		position: relative;
		width: calc(${design_tokens_1.designUnit} * 4px + 2px);
		height: calc(${design_tokens_1.designUnit} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${design_tokens_1.checkboxCornerRadius} * 1px);
		border: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.checkboxBorder};
		background: ${design_tokens_1.checkboxBackground};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${design_tokens_1.fontFamily};
		color: ${design_tokens_1.foreground};
		padding-inline-start: calc(${design_tokens_1.designUnit} * 2px + 2px);
		margin-inline-end: calc(${design_tokens_1.designUnit} * 2px + 2px);
		cursor: pointer;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.checked-indicator {
		width: 100%;
		height: 100%;
		display: block;
		fill: ${design_tokens_1.foreground};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${design_tokens_1.foreground};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${design_tokens_1.checkboxBackground};
		border-color: ${design_tokens_1.checkboxBorder};
	}
	:host(:enabled) .control:active {
		background: ${design_tokens_1.checkboxBackground};
		border-color: ${design_tokens_1.focusBorder};
	}
	:host(:${fast_foundation_1.focusVisible}) .control {
		border: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.focusBorder};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${fast_foundation_1.disabledCursor};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${design_tokens_1.disabledOpacity};
	}
`;
exports.checkboxStyles = checkboxStyles;
//# sourceMappingURL=checkbox.styles.js.map