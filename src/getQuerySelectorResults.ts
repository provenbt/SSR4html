export function getQuerySelectorResults(dom: any, searchText: string) {
    let results!: any[] | null;
    let searchResult!: string;
    try {
        results = dom.window.document.querySelectorAll(searchText);
        searchResult = "Result found to replace";
        if (results === null) {
            throw new Error("Invalid Query");
        }

        if (results.length === 0) {
            throw new Error("Nothing found to replace");
        }
    } catch (error: any) {
        console.log(error);
        results = null;
        searchResult = error.message;
    }

    return {results,searchResult};
}