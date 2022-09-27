const jsdom = require("jsdom");

export function isCssValid(property: string, value: string): boolean {
    // The property will be removed, so there is no need to check if it is valid.
    if (value ===  "null"){
        return true;
    }
    
    const dom = new jsdom.JSDOM(`<!DOCTYPE html><div>Test Object for CSS validator</div>`);
    const div = dom.window.document.querySelector("div");
    div.setAttribute("style", `${property}:${value};`);
 
    return (div.style.getPropertyValue(property) === value);
}