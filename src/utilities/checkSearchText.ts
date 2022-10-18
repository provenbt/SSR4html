const jsdom = require("jsdom");
const s2r = require("selector-2-regexp");

export function checkSearchText(searchText: string) {
    let result: string = "Valid";
    searchText = searchText.trim();

    try {
        const dom = new jsdom.JSDOM(`<!DOCTYPE html><div>Test Object to validate CSS selector</div>`);
        // It will be catched if provided CSS selector is invalid for query selector
        dom.window.document.querySelector(searchText);

        if (/(=['"]\])|((["'])\3)/g.test(searchText)) {
            throw new Error("An attribute value must be between quotation marks");
        }

        // It will be catched if provided CSS selector is invalid to generate a regular expression
        s2r.default(searchText);

        /*
            Be sure that the provided CSS selector is only one or combination of the followings:
            Type selector, class selector, id selector, or attribute selector.
            Any other kind of CSS selector is not supported to generate a regular expression.
        */
        const queries: string[] = searchText.split(',').map(v => v.trim());
        const unsupportedQueries = [];
        for (let query of queries) {
            if ((/(^[^A-Za-z#\[.])|([\+>\|])/g).test(query) || (/[\s\~*:](?![^\[]*\])/g).test(query)) {
                unsupportedQueries.push(query);
            }
        }

        if (unsupportedQueries.length > 0) {
            throw new Error(`Unsupported CSS selector(s): ${unsupportedQueries.join(' , ')}`);
        }
    } 
    catch (error: any) {
        result = error.message;
    }

    return result;
}