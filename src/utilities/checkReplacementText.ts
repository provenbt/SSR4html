import { createElementFromSelector } from "./createElementFromSelector";

export function checkReplacementText(choice: string, replaceText: string){
    replaceText = replaceText.trim();
    let result: string = "Valid";
    
    try {
        switch (choice) {
            case "Set Class":
            case "Append to Class":
            case "Remove from Class":
                const classValues = replaceText.split(' ');

                for (let classValue of classValues){
                    if (!(new RegExp(/^[A-Za-z]+.*/,'g').test(classValue.trim()))){
                        throw new Error("Invalid classname");
                    }      
                }

                break;

            case "Set Id":
                if (!(new RegExp(/^[A-Za-z]+.*/,'g').test(replaceText))){
                    throw new Error("Invalid id value");
                }
              
                break;

            case "Set Attribute":
                const attributeValuePairs: string[] = replaceText.split(',');
    
                for(let attributeValuePair of attributeValuePairs){
                    if (!(new RegExp(/^\s*[A-Za-z]+\s*=\s*[^<>]*[A-Za-z0-9]+[^<>]*$/,'g').test(attributeValuePair))){
                        throw new Error("Invalid attribute-value pair");
                    }
                }
            
                break;

            case "Change Tag Name":
                const newTagName = replaceText.replaceAll(' ','');
    
                if (!(new RegExp(/^[A-Za-z]+$/, 'g').test(newTagName))){
                    throw new Error("Invalid tag name");
                }
    
                break;

            case "Add Upper Tag":
                const parentInfo = replaceText.replaceAll(' ','');
                if (!(new RegExp( /^[A-Za-z]+.*$/, 'g').test(parentInfo))){
                    throw new Error("Invalid tag name");
                }
    
                const newParent = createElementFromSelector(parentInfo);
                if (newParent === null){
                    throw new Error("Invalid Selector to create HTML element");
                }
            
                break;

            case "Remove Attribute":
                if (replaceText.trim().includes(' ') && !(replaceText.includes(','))){
                    throw new Error("Use comma(,) beetwen attribute-name(s)");
                }

                const attributes: string[] = replaceText.split(',');
    
                for(let attribute of attributes){
                    if (!(new RegExp( /^[A-Za-z]+/,'g').test(attribute.trim()))){
                        throw new Error("Invalid attribute name");
                    }
                }
    
                break;

            case "Append to Attribute":
            case "Remove from Attribute":

                if(!(replaceText.includes(','))){
                    throw new Error("Use comma(,) beetwen attribute-name and value(s)");
                }

                const attributeName: string = replaceText.split(',')[0];
                const values : string[] = replaceText.split(',').slice(1).map(value => {
                    return value.trim();
                });

                if (!(new RegExp( /^[A-Za-z]+/,'g').test(attributeName))){
                    throw new Error("Invalid attribute name");
                }

                for(let value of values){
                    if (!(new RegExp(/^[^<>]*[A-Za-z0-9]+[^<>]*$/,'g').test(value))){
                        throw new Error("Invalid attribute value");
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