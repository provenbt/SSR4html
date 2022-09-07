export function getQuerySelectorResults(dom: any, searchText: string) {
    let results!: any[] | null;
    let searchResult: string = "Nothing found to replace";

    try {
        results = dom.window.document.querySelectorAll(searchText.replaceAll(' ',''));
    } catch (error) {
        console.log(error);
        results = null;
    
        if(searchResult.startsWith(`''`)){
            searchResult = "Please Provide a Search Query";
        }else{
            searchResult = `"${searchText}" is not a valid CSS selector`;
        }
    }

    return {results, searchResult};
}