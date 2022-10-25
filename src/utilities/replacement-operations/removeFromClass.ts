export function removeFromClass(querySelectorResults: any, replaceText: string) {
    const classNamesToRemove: string[] = replaceText.split(/\s/);

    for (let result of querySelectorResults) {
        if (result.hasAttribute("class")) {
            for (let className of classNamesToRemove) {
                // Remove a classname if the name really exists in the classname
                if (result.classList.contains(className)) {
                    result.classList.remove(className);
                }
            }
        }
    }
}