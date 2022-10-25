export function appendToAttribute(querySelectorResults: any, replaceText: string) {
    const attributeNameAndValuesToAppend: string[] = replaceText.split(/\s/);
    const attributeNameToAppend: string = attributeNameAndValuesToAppend[0];
    const valuesToAppend: string[] = attributeNameAndValuesToAppend.slice(1);

    for (let result of querySelectorResults) {
        const oldValue: string = result.getAttribute(attributeNameToAppend);

        if (oldValue !== null) {
            let newValue: string = oldValue;
            // Seperate each attribute value
            const oldValues = oldValue.split(/\s/).map(v => (v.trim())).filter(e => (e !== ""));

            // Append a value if the value do not already exists in the attribute
            for (let value of valuesToAppend) {
                if (!(oldValues.includes(value))) {
                    newValue = !(oldValue.endsWith(' ')) ? newValue + ' ' + value : newValue + value;
                    result.setAttribute(attributeNameToAppend, newValue);
                }
            }
        }
    }
}