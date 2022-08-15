"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonStyles = void 0;
const fast_element_1 = require("@microsoft/fast-element");
const fast_foundation_1 = require("@microsoft/fast-foundation");
const design_tokens_1 = require("../design-tokens");
/**
 * Developer note:
 *
 * The prettier-ignore command is used on this block of code because when removed the
 * '.control:${focusVisible}' CSS selector will be automatically reformatted to
 * '.control: ${focusVisible}' (note the space between the colon and dollar sign).
 *
 * This results in non-valid CSS that will not render a focus outline on base buttons.
 *
 * Additionally, this prettier command must be declared on the entire code block and not
 * directly above the CSS selector line because the below code block is a template literal
 * string which will end up being used directly in the final component CSS.
 *
 * Thus having '// prettier-ignore' directly in the final CSS will also break the component
 * styling.
 *
 * @internal
 */
// prettier-ignore
const BaseButtonStyles = (0, fast_element_1.css) `
	${(0, fast_foundation_1.display)('inline-flex')} :host {
		outline: none;
		font-family: ${design_tokens_1.fontFamily};
		font-size: ${design_tokens_1.typeRampBaseFontSize};
		line-height: ${design_tokens_1.typeRampBaseLineHeight};
		color: ${design_tokens_1.buttonPrimaryForeground};
		background: ${design_tokens_1.buttonPrimaryBackground};
		border-radius: calc(${design_tokens_1.cornerRadius} * 1px);
		fill: currentColor;
		cursor: pointer;
	}
	.control {
		background: transparent;
		height: inherit;
		flex-grow: 1;
		box-sizing: border-box;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: ${design_tokens_1.buttonPaddingVertical} ${design_tokens_1.buttonPaddingHorizontal};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.buttonBorder};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${design_tokens_1.buttonPrimaryHoverBackground};
	}
	:host(:active) {
		background: ${design_tokens_1.buttonPrimaryBackground};
	}
	.control:${fast_foundation_1.focusVisible} {
		outline: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.focusBorder};
		outline-offset: calc(${design_tokens_1.borderWidth} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${design_tokens_1.disabledOpacity};
		background: ${design_tokens_1.buttonPrimaryBackground};
		cursor: ${fast_foundation_1.disabledCursor};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${design_tokens_1.designUnit} * 4px);
		height: calc(${design_tokens_1.designUnit} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`;
/**
 * @internal
 */
const PrimaryButtonStyles = (0, fast_element_1.css) `
	:host([appearance='primary']) {
		background: ${design_tokens_1.buttonPrimaryBackground};
		color: ${design_tokens_1.buttonPrimaryForeground};
	}
	:host([appearance='primary']:hover) {
		background: ${design_tokens_1.buttonPrimaryHoverBackground};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${design_tokens_1.buttonPrimaryBackground};
	}
	:host([appearance='primary']) .control:${fast_foundation_1.focusVisible} {
		outline: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.focusBorder};
		outline-offset: calc(${design_tokens_1.borderWidth} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${design_tokens_1.buttonPrimaryBackground};
	}
`;
/**
 * @internal
 */
const SecondaryButtonStyles = (0, fast_element_1.css) `
	:host([appearance='secondary']) {
		background: ${design_tokens_1.buttonSecondaryBackground};
		color: ${design_tokens_1.buttonSecondaryForeground};
	}
	:host([appearance='secondary']:hover) {
		background: ${design_tokens_1.buttonSecondaryHoverBackground};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${design_tokens_1.buttonSecondaryBackground};
	}
	:host([appearance='secondary']) .control:${fast_foundation_1.focusVisible} {
		outline: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.focusBorder};
		outline-offset: calc(${design_tokens_1.borderWidth} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${design_tokens_1.buttonSecondaryBackground};
	}
`;
/**
 * @internal
 */
const IconButtonStyles = (0, fast_element_1.css) `
	:host([appearance='icon']) {
		background: ${design_tokens_1.buttonIconBackground};
		border-radius: ${design_tokens_1.buttonIconCornerRadius};
		color: ${design_tokens_1.foreground};
	}
	:host([appearance='icon']:hover) {
		background: ${design_tokens_1.buttonIconHoverBackground};
		outline: 1px dotted ${design_tokens_1.contrastActiveBorder};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${design_tokens_1.buttonIconPadding};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${design_tokens_1.buttonIconHoverBackground};
	}
	:host([appearance='icon']) .control:${fast_foundation_1.focusVisible} {
		outline: calc(${design_tokens_1.borderWidth} * 1px) solid ${design_tokens_1.focusBorder};
		outline-offset: ${design_tokens_1.buttonIconFocusBorderOffset};
	}
	:host([appearance='icon'][disabled]) {
		background: ${design_tokens_1.buttonIconBackground};
	}
`;
const buttonStyles = (context, definition) => (0, fast_element_1.css) `
	${BaseButtonStyles}
	${PrimaryButtonStyles}
	${SecondaryButtonStyles}
	${IconButtonStyles}
`;
exports.buttonStyles = buttonStyles;
//# sourceMappingURL=button.styles.js.map