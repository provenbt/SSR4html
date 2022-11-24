import strings from '../../stringVariables.json';

const jsdom = require("jsdom");

export function checkSearchText(searchText: string) {
    let result: string = "Valid";

    try {
        const dom = new jsdom.JSDOM(`<!DOCTYPE html><div>Test Object to validate CSS selector</div>`);
        // It will be catched if provided CSS selector is invalid for query selector
        dom.window.document.querySelector(searchText);

        if (/(=['"]\])|((["'])\3)/g.test(searchText)) {
            return strings.missingAttributeValueInSearchTextMessage;
        }

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
            result = `${strings.unsupportedCssSelectorMessage}: ${unsupportedQueries.join(' , ')}`;
        }
    } 
    catch (error: any) {
        console.log(error);
        result = `'${searchText}' ${strings.invalidCssSelectorMessage}`;
    }

    return result;
}