const jsdom = require("jsdom");

export function isAttributeNameValid(attributeName: string, operation: string) {
    let result = "Valid";

    try {
        const dom = new jsdom.JSDOM(`<!DOCTYPE html><div>Test Object for Attribute Name validator</div>`);
        const div = dom.window.document.querySelector("div");

        if (operation === "set") {
            div.setAttribute(attributeName, "any value");
        }
        else {
            div.removeAttribute(attributeName);
        }
    } catch (error: any) {
        result = error.message;
    }
 
    return result;
}