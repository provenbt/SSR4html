import { createElementFromSelector } from "./createElementFromSelector";

export function checkReplacementText(choice: string, replaceText: string){

    let result: string = "Valid";

    switch (choice) {
        case "Set Class":
            try {
                const re = /^[A-Za-z]+.*/g;
                if (!re.test(replaceText)){
                    throw new Error("Invalid class name format");
                }
                
            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Set Id":
            try {
                const re = /^[A-Za-z]+.*/g;
                if (!re.test(replaceText)){
                    throw new Error("Invalid id value format");
                }

            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Set Attribute":
            try {
                const re = /^[A-Za-z]+\s*=\s*[^<>]*[A-Za-z0-9]+[^<>]*$/g;
                if (!re.test(replaceText)){
                    throw new Error("Invalid attribute-value format");
                }

            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
        case "Change Tag":
            try {
                const newTagName = replaceText.replaceAll(' ','');
                const re = /^[A-Za-z]+$/g;
                if (!re.test(newTagName)){
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
                const re = /^[A-Za-z]+.*$/g;
                if (!re.test(parentInfo)){
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
                const re = /^[A-Za-z]+,?/g;
                replaceText = replaceText.trim().replaceAll(' ', '');
                if (!re.test(replaceText)){
                    throw new Error("Invalid attribute name format");
                }

            } catch (error: any) {
                console.log(error);
                result = error.message;
            }
            break;
    }

    return result;
}