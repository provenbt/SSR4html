export function removeUpperTag(querySelectorResults: any) {
    for (let result of querySelectorResults) {
        if (result.parentElement === null) {
            throw new Error(`${result.tagName.toLowerCase()} tag doesn't have an upper tag`);
        }

        //Remove any upper tag except HTML, HEAD and BODY tags
        if (result.parentElement.tagName !== "HTML" && result.parentElement.tagName !== "HEAD" && result.parentElement.tagName !== "BODY") {
            result.parentElement.replaceWith(...result.parentElement.childNodes);
        }
    }
}