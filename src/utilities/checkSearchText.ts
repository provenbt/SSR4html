const jsdom = require("jsdom");

export function checkSearchText(searchText: string) {
    let result: string = "Valid";
    
    try {
        const dom = new jsdom.JSDOM(`<!DOCTYPE html><div>Test Object to validate CSS selector</div>`);
        dom.window.document.querySelector(searchText.trim());
        
        /*
            Be sure that the provided CSS selector is only one or combination of the followings:
            Type selector, class selector, id selector, or attribute selector.
            Any other kind of selector is not supported.
        */
       const queries: string[] = searchText.split(',').map(v => v.trim());
       for (let query of queries){
           if ((/(^[^A-Za-z#\[.])|([\+>\|])/g).test(query) || (/[\s\~*:](?![^\[]*\])/g).test(query)) {
               throw new Error(`Provided CSS selector '${query}' is not supported`);
           } 
       }
    } catch (error: any) {
        result = error.message;
    }

    return result;
}