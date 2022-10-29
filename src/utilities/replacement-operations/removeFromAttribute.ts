export function removeFromAttribute(querySelectorResults: any, replaceText: string) {
    const attributeNameAndValuesToRemove: string[] = replaceText.split(/\s/);
    const attributeNameToRemove: string = attributeNameAndValuesToRemove[0];
    const valuesToRemove: string[] = attributeNameAndValuesToRemove.slice(1);

    for (let result of querySelectorResults) {
        const oldValue: string = result.getAttribute(attributeNameToRemove);

        if (oldValue !== null) {
            let newValue: string = oldValue;
            // Seperate each attribute value
            const oldValues: string[] = oldValue.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

            // Remove a value if the value really exists in the attribute
            for (let value of valuesToRemove) {
                if (oldValues.includes(value)) {
                    newValue = newValue.replace(new RegExp(`(?:^|[\\s])${value}(?:$|[\\s])`, 'g'), ' ');
                }
            }
            result.setAttribute(attributeNameToRemove, newValue.trim());
        }
    }
}