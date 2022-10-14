/*  createElementFromSelector(selector)
================================================
Usage: element#id.class[attribute='value']
================================================ */
const jsdom = require("jsdom");

export function createElementFromSelector(selector: string) {
    const pattern = /^(.+?)(?:#(.+?))?(?:\.(.+?))?(?:\[(.+?)(?:[='"]{2}([^'"]+?)["']\])?)?$/;
    const matches = selector.match(pattern);

    const { document } = (new jsdom.JSDOM()).window;
    const element = document.createElement(matches![1]);
    
    if (matches![2]) { element.id = matches![2]; }
    if (matches![3]) { element.className = matches![3]; }
    if (matches![4] && matches![5]) { element.setAttribute(matches![4].trim(), matches![5].trim()); }
    
    return element;
}