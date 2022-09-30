import { createElementFromSelector } from "./createElementFromSelector";
import { isCssValid } from "./isCssValid";

export function checkReplacementText(choice: string, replaceText: string) {
    replaceText = replaceText.trim();
    let result: string = "Valid";

    try {
        switch (choice) {
            case "Set Class":
            case "Append to Class":
            case "Remove from Class":
                const classValues = replaceText.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));
                for (let classValue of classValues) {
                    if (!(new RegExp(/^[A-Za-z]+.*/, 'g').test(classValue))) {
                        throw new Error("Invalid classname");
                    }
                }

                break;

            case "Set Id":
                const id = replaceText.trim();
                if (!(new RegExp(/^[A-Za-z]+[\-:_.A-Za-z0-9]*$/, 'g').test(id))) {
                    throw new Error("Invalid id value");
                }

                break;

            case "Set Attribute":
                const attributeValuePairs: string[] = replaceText.split(',');

                for (let attributeValuePair of attributeValuePairs) {
                    if (!(new RegExp(/^\s*[A-Za-z]+\s*=\s*[^<>]*[A-Za-z0-9]+[^<>]*$/, 'g').test(attributeValuePair))) {
                        throw new Error("Invalid attribute-value pair");
                    }

                    let attribute = attributeValuePair.split('=')[0].replaceAll(' ', '');
                    if (attribute === "style"){
                        throw new Error("Use 'Set Style Property' option to set value(s) to the style attribute");
                    }
                }

                break;

            case "Change Tag Name":
                const newTagName = replaceText.replaceAll(' ', '');

                if (!(new RegExp(/^[A-Za-z]+$/, 'g').test(newTagName))) {
                    throw new Error("Invalid tag name");
                }

                break;

            case "Add Upper Tag":
                const parentInfo = replaceText.replaceAll(' ', '');
                if (!(new RegExp(/^[A-Za-z]+.*$/, 'g').test(parentInfo))) {
                    throw new Error("Invalid tag name");
                }

                const newParent = createElementFromSelector(parentInfo);
                if (newParent === null) {
                    throw new Error("Invalid Selector to create HTML element");
                }

                break;

            case "Remove Attribute":
                if (replaceText.trim().includes(' ') && !(replaceText.includes(','))) {
                    throw new Error("Use comma(,) beetwen attribute-name(s)");
                }

                const attributes: string[] = replaceText.split(',');

                for (let attribute of attributes) {
                    if (!(new RegExp(/^[A-Za-z]+/, 'g').test(attribute.trim()))) {
                        throw new Error("Invalid attribute name");
                    }
                }

                break;

            case "Append to Attribute":
            case "Remove from Attribute":

                if (!(replaceText.includes(','))) {
                    throw new Error("Use comma(,) beetwen attribute-name and value(s)");
                }

                const attributeName: string = replaceText.split(',')[0].trim();
                const values: string[] = replaceText.split(',').slice(1).map(value => {
                    return value.trim();
                });

                if (attributeName === "style") {
                    throw new Error("Use 'Edit Style Property' option to edit value(s) of the style attribute");
                }

                if (!(new RegExp(/^[A-Za-z]+/, 'g').test(attributeName))) {
                    throw new Error("Invalid attribute name");
                }

                for (let value of values) {
                    if (!(new RegExp(/^[^<>]*[A-Za-z0-9]+[^<>]*$/, 'g').test(value))) {
                        throw new Error("Invalid attribute value");
                    }
                }

                break;

            case "Set Style Property":
            case "Edit Style Property":
                const propertiesInfo = replaceText.split(',');

                for (let propertyAndValue of propertiesInfo) {
                    if (!(new RegExp(/^@?[a-z]+(\-[a-z]+)?\s*\:(\s*[a-z0-9]+)+$/, 'g').test(propertyAndValue.trim()))) {
                        throw new Error("Invalid property-value pair");
                    }
                }

                const propertiesAndValues = propertiesInfo.map(v => (v.split(':').map(a => (a.trim()))));
                for (let propertyAndValue of propertiesAndValues) {
                    if (!(isCssValid(propertyAndValue[0], propertyAndValue[1]))) {
                        throw new Error("Invalid property-value pair");
                    }
                }

                break;
        }
    }
    catch (error: any) {
        console.log(error);
        result = error.message;
    }

    return result;
}