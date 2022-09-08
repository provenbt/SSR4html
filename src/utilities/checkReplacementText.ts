import { createElementFromSelector } from "./createElementFromSelector";

export function checkReplacementText(choice: string, replaceText: string){

    let result: string = "Valid";

    switch (choice) {
        case "Set Class":
            try {
                if (!(new RegExp(/^[A-Za-z]+.*/,'g').test(replaceText))){
                    throw new Error("Invalid class name format");
                }    
            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Set Id":
            try {
                if (!(new RegExp(/^[A-Za-z]+.*/,'g').test(replaceText))){
                    throw new Error("Invalid id value format");
                }
            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Set Attribute":
            try {
                const attributeValuePairs: string[] = replaceText.split(',');

                for(let attributeValuePair of attributeValuePairs){
                    if (!(new RegExp(/^\s*[A-Za-z]+\s*=\s*[^<>]*[A-Za-z0-9]+[^<>]*$/,'g').test(attributeValuePair))){
                        throw new Error("Invalid attribute-value format");
                    }
                }
            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Change Tag":
            try {
                const newTagName = replaceText.replaceAll(' ','');

                if (!(new RegExp(/^[A-Za-z]+$/, 'g').test(newTagName))){
                    throw new Error("Invalid tag format");
                }

            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Add Upper Tag":
            try {
                const parentInfo = replaceText.replaceAll(' ','');
        
                if (!(new RegExp( /^[A-Za-z]+.*$/, 'g').test(parentInfo))){
                    throw new Error("Invalid tag format");
                }

                const newParent = createElementFromSelector(parentInfo);
                if (newParent === null){
                    throw new Error("Invalid Selector to create HTML element");
                }

            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Remove Attribute":
            try {
                replaceText = replaceText.replaceAll(' ', '');
                const attributes: string[] = replaceText.split(',');

                for(let attribute of attributes){
                    if (!(new RegExp( /^[A-Za-z]+/,'g').test(attribute))){
                        throw new Error("Invalid attribute name format");
                    }
                }
            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
    }

    return result;
}