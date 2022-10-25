export function appendToClass(querySelectorResults: any, replaceText: string) {
    const classNamesToAppend: string[] = replaceText.split(/\s/);

    for (let result of querySelectorResults) {
        if (result.hasAttribute("class")) {
            for (let className of classNamesToAppend) {
                // Append a classname if the name does not exist in the classname
                if (!(result.classList.contains(className))) {
                    result.classList.add(className);
                }
            }
        }
    }
}