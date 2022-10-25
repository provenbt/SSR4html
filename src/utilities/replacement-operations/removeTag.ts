export function removeTag(querySelectorResults: any) {
    for (let result of querySelectorResults) {
        result.remove();
    }
}