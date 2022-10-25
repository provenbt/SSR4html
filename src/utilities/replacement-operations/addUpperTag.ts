import { createElementFromSelector } from "../createElementFromSelector";

export function addUpperTag(querySelectorResults: any, replaceText: string) {
    const parentInfo: string = replaceText;

    for (let result of querySelectorResults) {
        // Create HTML element that will be upper tag
        const newParent = createElementFromSelector(parentInfo);
        // Insert before the matched node(result)
        result.parentNode.insertBefore(newParent, result);
        // Append the matched node(result) as the child of the created HTML element
        newParent.appendChild(result);
    }
}