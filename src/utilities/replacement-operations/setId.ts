export function setId(querySelectorResults: any, replaceText: string) {
    const id: string = replaceText;

    for (let result of querySelectorResults) {
        result.id = id;
    }
}