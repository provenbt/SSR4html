export function setClass(querySelectorResults: any, replaceText: string) {
    const className: string = replaceText;

    for (let result of querySelectorResults) {
        result.className = className;
    }
}