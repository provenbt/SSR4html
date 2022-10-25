export function setAttribute(querySelectorResults: any, replaceText: string) {
    const attributeNameAndValuesToSet: string[] = replaceText.split(/\s/);
    const attributeNameToSet: string = attributeNameAndValuesToSet[0];
    const valuesToSet: string[] = attributeNameAndValuesToSet.slice(1);

    for (let result of querySelectorResults) {
        result.setAttribute(attributeNameToSet, valuesToSet.join(' '));
    }
}