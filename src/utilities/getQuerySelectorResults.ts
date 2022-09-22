export function getQuerySelectorResults(dom: any, searchText: string) {
    let results !: any[];
    let searchOperationResult: string = "";

    try {
        results = dom.window.document.querySelectorAll(searchText);

        if (results === undefined || results === null){
            throw new Error(`"${searchText}" is not a valid CSS selector`);
        } 
        
        if (results.length === 0){
            searchOperationResult = "Nothing found to replace";
        }
        else {
            searchOperationResult = "Result found to replace";
        }
        
    } catch (error: any) {
        console.log(error);
        searchOperationResult = error.message;
    }

    return {results, searchOperationResult};
}