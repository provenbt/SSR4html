export function removeAttribute(querySelectorResults: any, replaceText: string) {
    const attributesToRemove: string[] = replaceText.split(/\s/);

    for (let result of querySelectorResults) {
        for (let attributeName of attributesToRemove) {
            // Remove only exist attributes in the element
            if (result.hasAttribute(attributeName)) {
                result.removeAttribute(attributeName);
            }
        }
    }
}