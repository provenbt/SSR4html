const jsdom = require('jsdom');

export function editTagName(querySelectorResults: any, replaceText: string) {
    const newTagName: string = replaceText;
    const { document } = (new jsdom.JSDOM()).window;

    for (let result of querySelectorResults) {
        // Create the document fragment 
        const frag = document.createDocumentFragment();

        // Fill it with what's in the source element 
        while (result.firstChild) {
            frag.appendChild(result.firstChild);
        }
        // Create the new element 
        const newElem = document.createElement(newTagName);
        // Empty the document fragment into it 
        newElem.appendChild(frag);
        //Get all attribute-value pairs
        const attributeNames = result.getAttributeNames();
        for (let name of attributeNames) {
            let value = result.getAttribute(name);
            newElem.setAttribute(name, value);
        }
        // Replace the source element with the new element on the page 
        result.parentNode.replaceChild(newElem, result);
    }
}