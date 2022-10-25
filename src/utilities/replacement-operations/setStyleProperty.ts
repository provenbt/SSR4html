export function setStyleProperty(querySelectorResults: any, replaceText: string) {
    const propertiesInfoToSet: string[] = replaceText.split(',');

    for (let result of querySelectorResults) {
        // Overwrite style attribute if it is already defined in the element
        if (result.hasAttribute("style")) {
            result.removeAttribute("style");
        }

        const propertiesAndValues: string[][] = propertiesInfoToSet.map(v => (v.split(':').map(a => (a.trim()))));
        for (let propertyAndValue of propertiesAndValues) {
            // Change null(string value) with empty string value to delete the property
            if (propertyAndValue[1] === "null") {
                propertyAndValue[1] = "";
            }

            result.style.setProperty(propertyAndValue[0], propertyAndValue[1]);
        }
    }
}