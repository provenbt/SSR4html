export function getQuerySelectorResults(dom: any, searchText: string) {
    let results!: any[] | null;
    let searchResult!: string;

    try {
        results = dom.window.document.querySelectorAll(searchText.replaceAll(' ',''));
        searchResult = "Result found to replace";

    } catch (error: any) {
        console.log(error);
        results = null;
        searchResult = error.message;
    }

    return {results,searchResult};
}