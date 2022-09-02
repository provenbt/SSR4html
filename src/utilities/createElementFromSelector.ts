/*  createElementFromSelector(selector)
================================================
Usage: element#id.class[attribute=value] 
                    or
Usage: element#id.class[attribute="value"] 
================================================ */
const jsdom = require("jsdom");

export function createElementFromSelector(selector: string) {
    let element;
    try {
        let pattern = /^(.*?)(?:#(.*?))?(?:\.(.*?))?(?:[[](.*?)(?:=(.*?))?)?$/;
        let matches = selector.match(pattern);

        if(matches === null){
            throw new Error("Invalid Selector to create HTML element");
        }
    
        const { document } = (new jsdom.JSDOM()).window;
        element = document.createElement(matches[1].toLowerCase()||'div');
        if(matches[2]) {element.id = matches[2];}
        if(matches[3]) {element.className = matches[3];}
        if(matches[4]) {element.setAttribute(matches[4],matches[5].replace(']',"").replaceAll(/'|"/g,"")||'');}
        
    } catch (error) {
        element = null;
    }

    return element;
}