import { isAttributeNameValid } from './validators/isAttributeNameValid';
import { isCssValid } from './validators/isCssValid';
import strings from '../../stringVariables.json';

export function checkReplacementText(choice: string, replaceText: string) {
    // Replace text is innocent until an error found in it
    let result = "Valid";
    let validatedReplaceText: string | null = replaceText;

    try {
        switch (choice) {
            case strings.setClassNameText:
            case strings.appendClassNameText:
            case strings.removeClassNameText:
                const classValues = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));
                const invalidClassValues = [];

                for (let classValue of classValues) {
                    if (!(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(classValue))) {
                        invalidClassValues.push(classValue);
                    }
                }

                if (invalidClassValues.length > 0) {
                    throw new Error(`${strings.İnvalidClassNamePluralMessage}: ${invalidClassValues.join(' , ')}`);
                }

                validatedReplaceText = classValues.join(' ');
                break;

            case strings.setIdValueText:
                const id = replaceText;

                if (!(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(id))) {
                    throw new Error(`"${id}" ${strings.İnvalidIdValueMessage}`);
                }

                validatedReplaceText = id;
                break;

            case strings.setAttributeText:
            case strings.appendAttributeValueText:
            case strings.removeAttributeValueText:
                const attributeNameAndValues = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");

                const attributeName = attributeNameAndValues[0];

                if (isAttributeNameValid(attributeName, "set") !== "Valid") {
                    throw new Error(`"${attributeName}" ${strings.invalidAttributeNameSingularMessage}`);
                }

                if (attributeName === "style") {
                    throw new Error(strings.invalidOptionToArrangeStyleAttributeMessage);
                }

                if (attributeNameAndValues.length === 1) {
                    throw new Error(strings.missingAttributeValueMessage);
                }

                const attributeValues = attributeNameAndValues.slice(1);
                const invalidAttributeValues = [];

                for (let attributeValue of attributeValues) {
                    if (new RegExp(/["'&<>]/, 'g').test(attributeValue)) {
                        invalidAttributeValues.push(attributeValue);
                    }
                }

                if (invalidAttributeValues.length > 0) {
                    throw new Error(`${strings.invalidAttributeValuePluralMessage}: ${invalidAttributeValues.join(' , ')}`);
                }

                validatedReplaceText = attributeNameAndValues.join(' ');
                break;

            case strings.editTagNameText:
                const newTagName = replaceText;

                if (!(new RegExp(/^[a-z]+$/, 'g').test(newTagName))) {
                    throw new Error(strings.invalidTagNameMessage);
                }

                validatedReplaceText = newTagName;
                break;

            case strings.addUpperTagText:
                const parentInfo = replaceText;

                const pattern = /^(.+?)(?:#(.+?))?(?:\.(.+?))?(?:\[(.+?)(?:[='"]{2}([^'"]+?)["']\])?)?$/;
                const matches = parentInfo.match(pattern);

                if (matches === null) {
                    throw new Error(strings.invalidSelectorToCreateHtmlElementMessage);
                }

                if (matches[1] && !(new RegExp(/^[a-z]+$/, 'g').test(matches[1]))) {
                    throw new Error(strings.invalidTagNameMessage);
                }

                if (matches[2] && !(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(matches[2]))) {
                    throw new Error(`"${matches[2]}" ${strings.İnvalidIdValueMessage}`);
                }

                if (matches[3] && !(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(matches[3]))) {
                    throw new Error(`"${matches[3]}" ${strings.İnvalidClassNameSingularMessage}`);
                }

                if (matches[4] && matches[5] === undefined) {
                    throw new Error(strings.invalidAttributeValuePairStructureMessage);
                }

                if (matches[4] && isAttributeNameValid(matches[4].trim(), "set") !== "Valid") {
                    throw new Error(`"${matches[4].trim()}" ${strings.invalidAttributeNameSingularMessage}`);
                }

                if (matches[5] && new RegExp(/[&<>]/, 'g').test(matches[5])) {
                    throw new Error(`"${matches[5].trim()}" ${strings.invalidAttributeNameSingularMessage}`);
                }

                validatedReplaceText = parentInfo;
                break;

            case strings.removeAttributeText:
                const attributeNames = replaceText.split(/\s/).map(v => v.trim()).filter(e => e !== "");
                const invalidAttributeNames = [];

                for (let attributeName of attributeNames) {
                    if (isAttributeNameValid(attributeName, "remove") !== "Valid") {
                        invalidAttributeNames.push(attributeName);
                    }
                }

                if (invalidAttributeNames.length > 0) {
                    throw new Error(`${strings.invalidAttributeNamePluralMessage}: ${invalidAttributeNames.join(' , ')}`);
                }

                validatedReplaceText = attributeNames.join(' ');
                break;

            case strings.setStylePropertyText:
            case strings.editStylePropertyText:
                const propertiesInfo = replaceText.split(',').map(v => v.trim()).filter(e => e !== "");
                const invalidStyleStructure = [];

                for (let propertyAndValue of propertiesInfo) {
                    if (!(new RegExp(/^@?[a-z]+(\-[a-z]+)*\s*\:\s*[\S]+$/, 'g').test(propertyAndValue))) {
                        invalidStyleStructure.push(propertyAndValue);
                    }
                }

                if (invalidStyleStructure.length > 0) {
                    throw new Error(`${strings.invalidPropertyValueStructureMessage}: ${invalidStyleStructure.join(' , ')}`);
                }

                const propertiesAndValues = propertiesInfo.map(v => (v.split(':').map(a => (a.trim()))));
                const invalidStyleProperties = [];

                for (let propertyAndValue of propertiesAndValues) {
                    if (!(isCssValid(propertyAndValue[0], propertyAndValue[1]))) {
                        invalidStyleProperties.push(`${propertyAndValue[0]}: ${propertyAndValue[1]}`);
                    }
                }

                if (invalidStyleProperties.length > 0) {
                    throw new Error(`${strings.invalidPropertyValuePairMessage}: ${invalidStyleProperties.join(' , ')}`);
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