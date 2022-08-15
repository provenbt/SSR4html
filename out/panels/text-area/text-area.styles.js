"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.textAreaStyles = void 0;
const fast_element_1 = require("@microsoft/fast-element");
const fast_foundation_1 = require("@microsoft/fast-foundation");
const design_tokens_1 = require("../design-tokens");
const textAreaStyles = (context, definition) => (0, fast_element_1.css) `
	${(0, fast_foundation_1.display)('inline-block')} :host {
		font-family: ${design_tokens_1.fontFamily};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${design_tokens_1.inputForeground};
		background: ${design_tokens_1.inputBackground};
		border-radius: calc(${design_tokens_1.cornerRadius} * 1px);
		border: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.dropdownBorder};
		font: inherit;
		font-size: ${design_tokens_1.typeRampBaseFontSize};
		line-height: ${design_tokens_1.typeRampBaseLineHeight};
		padding: calc(${design_tokens_1.designUnit} * 2px + 1px);
		width: 100%;
		min-width: ${design_tokens_1.inputMinWidth};
		resize: none;
	}
	.control:hover:enabled {
		background: ${design_tokens_1.inputBackground};
		border-color: ${design_tokens_1.dropdownBorder};
	}
	.control:active:enabled {
		background: ${design_tokens_1.inputBackground};
		border-color: ${design_tokens_1.focusBorder};
	}
	.control:hover,
	.control:${fast_foundation_1.focusVisible},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${design_tokens_1.scrollbarWidth};
		height: ${design_tokens_1.scrollbarHeight};
	}
	.control::-webkit-scrollbar-corner {
		background: ${design_tokens_1.inputBackground};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${design_tokens_1.scrollbarSliderBackground};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${design_tokens_1.scrollbarSliderHoverBackground};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${design_tokens_1.scrollbarSliderActiveBackground};
	}
	:host(:focus-within:not([disabled])) .control {
		border-color: ${design_tokens_1.focusBorder};
	}
	:host([resize='both']) .control {
		resize: both;
	}
	:host([resize='horizontal']) .control {
		resize: horizontal;
	}
	:host([resize='vertical']) .control {
		resize: vertical;
	}
	.label {
		display: block;
		color: ${design_tokens_1.foreground};
		cursor: pointer;
		font-size: ${design_tokens_1.typeRampBaseFontSize};
		line-height: ${design_tokens_1.typeRampBaseLineHeight};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${fast_foundation_1.disabledCursor};
	}
	:host([disabled]) {
		opacity: ${design_tokens_1.disabledOpacity};
	}
	:host([disabled]) .control {
		border-color: ${design_tokens_1.dropdownBorder};
	}
`;
exports.textAreaStyles = textAreaStyles;
//# sourceMappingURL=text-area.styles.js.map