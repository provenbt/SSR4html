export function getQuerySelectorResults(dom: any, searchText: string) {
    let results !: any[];
    let searchResult: string = "";

    try {
        results = dom.window.document.querySelectorAll(searchText);

        if (results === undefined || results === null){
            throw new Error(`"${searchText}" is not a valid CSS selector`);
        } 
        
        if (results.length === 0){
            searchResult = "Nothing found to replace";
        }
        else {
            searchResult = "Result found to replace";
        }
        
    } catch (error: any) {
        console.log(error);
        searchResult = error.message;
    }

    return {results, searchResult};
}