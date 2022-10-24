import { isAttributeNameValid } from "./validators/isAttributeNameValid";
import { isCssValid } from "./validators/isCssValid";

export function checkReplacementText(choice: string, replaceText: string) {
    // Replace text is innocent until an error found in it
    let result = "Valid";
    let validatedReplaceText: string | null = replaceText;

    try {
        switch (choice) {
            case "Set Class":
            case "Append to Class":
            case "Remove from Class":
                const classValues = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));
                const invalidClassValues = [];

                for (let classValue of classValues) {
                    if (!(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(classValue))) {
                        invalidClassValues.push(classValue);
                    }
                }

                if (invalidClassValues.length > 0) {
                    throw new Error(`Invalid class-name(s): ${invalidClassValues.join(' , ')}`);
                }

                validatedReplaceText = classValues.join(' ');
                break;

            case "Set Id":
                const id = replaceText;

                if (!(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(id))) {
                    throw new Error(`"${id}" is an invalid id value`);
                }

                validatedReplaceText = id;
                break;

            case "Set Attribute":
            case "Append to Attribute":
            case "Remove from Attribute":
                const attributeNameAndValues = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");

                const attributeName = attributeNameAndValues[0];

                if (isAttributeNameValid(attributeName, "set") !== "Valid") {
                    throw new Error(`"${attributeName}" is an invalid attribute name`);
                }

                if (attributeName === "style") {
                    throw new Error("Use 'Set/Edit Style Property' option to set or modify style attribute");
                }

                if (attributeNameAndValues.length === 1) {
                    throw new Error("Please, provide at least one attribute value");
                }

                const attributeValues = attributeNameAndValues.slice(1);
                const invalidAttributeValues = [];

                for (let attributeValue of attributeValues) {
                    if (new RegExp(/["'&<>]/, 'g').test(attributeValue)) {
                        invalidAttributeValues.push(attributeValue);
                    }
                }

                if (invalidAttributeValues.length > 0) {
                    throw new Error(`Invalid attribute value(s): ${invalidAttributeValues.join(' , ')}`);
                }

                validatedReplaceText = attributeNameAndValues.join(' ');
                break;

            case "Change Tag Name":
                const newTagName = replaceText;

                if (!(new RegExp(/^[a-z]+$/, 'g').test(newTagName))) {
                    throw new Error("Invalid tag name (only lowercase english letters allowed)");
                }

                validatedReplaceText = newTagName;
                break;

            case "Add Upper Tag":
                const parentInfo = replaceText;

                const pattern = /^(.+?)(?:#(.+?))?(?:\.(.+?))?(?:\[(.+?)(?:[='"]{2}([^'"]+?)["']\])?)?$/;
                const matches = parentInfo.match(pattern);

                if (matches === null) {
                    throw new Error("Invalid Selector to create HTML element");
                }

                if (matches[1] && !(new RegExp(/^[a-z]+$/, 'g').test(matches[1]))) {
                    throw new Error("Invalid tag name (only lowercase english letters allowed)");
                }

                if (matches[2] && !(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(matches[2]))) {
                    throw new Error(`"${matches[2]}" is an invalid id value`);
                }

                if (matches[3] && !(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(matches[3]))) {
                    throw new Error(`"${matches[3]}" is an invalid class-name`);
                }

                if (matches[4] && matches[5] === undefined) {
                    throw new Error("Please, follow this format [attribute='value'] to set attribute");
                }

                if (matches[4] && isAttributeNameValid(matches[4].trim(), "set") !== "Valid") {
                    throw new Error(`"${matches[4].trim()}" is an invalid attribute name`);
                }

                if (matches[5] && new RegExp(/[&<>]/, 'g').test(matches[5])) {
                    throw new Error(`"${matches[5].trim()}" is an invalid attribute value`);
                }

                validatedReplaceText = parentInfo;
                break;

            case "Remove Attribute":
                const attributeNames = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");
                const invalidAttributeNames = [];

                for (let attributeName of attributeNames) {
                    if (isAttributeNameValid(attributeName, "remove") !== "Valid") {
                        invalidAttributeNames.push(attributeName);
                    }
                }

                if (invalidAttributeNames.length > 0) {
                    throw new Error(`Invalid attribute name(s): ${invalidAttributeNames.join(' , ')}`);
                }

                validatedReplaceText = attributeNames.join(' ');
                break;

            case "Set Style Property":
            case "Edit Style Property":
                const propertiesInfo = replaceText.split(',').map(v => v.trim()).filter(e => e !== "");
                const invalidStyleStructure = [];

                for (let propertyAndValue of propertiesInfo) {
                    if (!(new RegExp(/^@?[a-z]+(\-[a-z]+)*\s*\:\s*[\S]+$/, 'g').test(propertyAndValue))) {
                        invalidStyleStructure.push(propertyAndValue);
                    }
                }

                if (invalidStyleStructure.length > 0) {
                    throw new Error(`Invalid property-value structure(s): ${invalidStyleStructure.join(' , ')}`);
                }

                const propertiesAndValues = propertiesInfo.map(v => (v.split(':').map(a => (a.trim()))));
                const invalidStyleProperties = [];

                for (let propertyAndValue of propertiesAndValues) {
                    if (!(isCssValid(propertyAndValue[0], propertyAndValue[1]))) {
                        invalidStyleProperties.push(`${propertyAndValue[0]}: ${propertyAndValue[1]}`);
                    }
                }

                if (invalidStyleProperties.length > 0) {
                    throw new Error(`Invalid property-value pair(s): ${invalidStyleProperties.join(' , ')}`);
                }

                validatedReplaceText = propertiesInfo.join(',');
                break;
        }
    }
    catch (error: any) {
        console.log(error);
        result = error.message;
        validatedReplaceText = null;
    }

    return {result, validatedReplaceText};
}