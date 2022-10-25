export function editStyleProperty(querySelectorResults: any, replaceText: string) {
    const propertiesInfoToEdit: string[] = replaceText.split(',');

    for (let result of querySelectorResults) {
        // Edit style properties if and only if the tag has style attribute defined
        if (result.hasAttribute("style")) {
            const propertiesAndValues: string[][] = propertiesInfoToEdit.map(v => (v.split(':').map(a => (a.trim()))));
            for (let propertyAndValue of propertiesAndValues) {
                // Change null(string value) with empty string value to delete the property
                if (propertyAndValue[1] === "null") {
                    propertyAndValue[1] = "";
                }
                // Append a property if it has a different value
                if (result.style.getPropertyValue(propertyAndValue[0]) !== propertyAndValue[1]) {
                    result.style.setProperty(propertyAndValue[0], propertyAndValue[1]);
                }
            }
        }
    }
}