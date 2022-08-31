export function getQuerySelectorResults(dom: any, searchText: string) {
    let results!: any[] | null;
    let searchResult: string = "Nothing found to replace";

    try {
        results = dom.window.document.querySelectorAll(searchText.replaceAll(' ',''));
    } catch (error: any) {
        console.log(error);
        results = null;
        searchResult = error.message;
    
        if(searchResult.startsWith(`''`)){
            searchResult = "Please Provide a Search Query";
        }
    }

    return {results, searchResult};
}