/*
    It generates regular expression from basic CSS selector(s) (type, id, class, & attribute selectors).

    The generated regular expressions meet the structure of single line HTML elements that have
    specified features that is defined in the provided CSS selector(s).

    Regular expressions mainly generated according to selector-2-regexp, which is a node package that 
    is written by Yoshiro Matsumoto. However, I updated the resulting regular expressions to fix certain 
    neglected aspects in the package's algorithm and made it compatible with the sidebar search of VS code.

    More information about the package can be found here https://github.com/m-yoshiro/Selector2Regexp
*/

const s2r = require("selector-2-regexp");

export function convertToRegex(searchText: string): String {
    // Search Text may include more than one CSS selector (refered as queries)
    const queries: string[] | null = searchText.split(',');
    // To store RegExp(s)
    let regex: string[] = [];

    try {
        let index = 0;
        // Generate a RegExp for each CSS selector(query)
        for (let query of queries) {
            //Remove unnecessary characters
            query = query.trim();

            /*
                Be sure that the provided CSS selector is only one or combination of the followings:
                Type selector, class selector, id selector, or attribute selector.
                Any other kind of selector is not supported
            */
            if ((/(^[^A-Za-z#\[.])|([\+>\|])/g).test(query) || (/[\s\~*:](?![^\[]*\])/g).test(query)) {
                throw new Error("Unsupported CSS selector detected");
            }

            // Get RegExp of the provided CSS selector
            regex[index] = s2r.default(query);

            // Means there is type selector in the query 
            if (query.match(/^[A-Za-z]+.*/g) !== null) {
                //Parse element(tag) name
                let tagName = query.split(/[#\[.]/g)[0];
                tagName = query.split(/[#\[.]/g)[0];

                /*
                    Be sure that the generated RegExp mathes the exact element(tag) name in the query
                    (e.g, "b" must match "b tags" but not match any other tag starts with "b" such as body)
                */
                regex[index] = regex[index].replace(`${tagName}`, `(?<!\\w)${tagName}(?!\\w)`);
            }

            // Means there is at least one attribute selector in the query
            if (query.includes('[')) {
                const findAttributes = /\[\s*(.+?)\s*(\=|\])/g;

                const attributes = [];
                let m;

                // Find all attribute names
                while ((m = findAttributes.exec(query)) !== null) {
                    attributes.push(m[0]);
                }

                /*
                    Edit the generated RegExp for attribute selectors to accept whitespaces 
                    before and after the equality(=) symbol
                */
                for (let attribute of attributes) {

                    attribute = attribute.replace(/[\^\$*\~\[\]\=]/g, '').trim();

                    regex[index] = regex[index].replace(`${attribute}=`, `${attribute}`).
                        replace(`${attribute}`, `${attribute}=`).
                        replace(`${attribute}=`, `${attribute}\\s*=\\s*`);
                }

                /*
                    Generated RegExp for the attribute selectors with endswith($=) and 
                    startswith(^=) features was wrong. This issue was fixed here
                */
                if (query.includes("$=") || query.includes("^=")) {

                    const attributeQueries = query.split('[');
                    attributeQueries.shift();

                    for (let atrQuery of attributeQueries) {
                        let value = atrQuery.slice(atrQuery.indexOf('=') + 1, atrQuery.indexOf(']'));
                        value = value.replace(/"|'/g, '');

                        if (atrQuery.includes("$=")) {
                            regex[index] = regex[index].replace(`${value}[\\s`, `${value}[`);
                        } else if (atrQuery.includes("^=")) {
                            regex[index] = regex[index].replace(`[\\s'"]${value}`, `['"]${value}`);
                        }
                    }
                }
            }

            /*
                Edit the generated RegExp for the class and id selectors 
                to accept whitespaces before and after the equality(=) symbol
            */
            regex[index] = regex[index].replace("class=", "class\\s*=\\s*").replace("id=", "id\\s*=\\s*");

            // Make the generated RegExp(s) compatible with the RegExp engine of the VS code's sidebar search
            regex[index] = regex[index].replaceAll(`.*[\\s'"]`, `[^=]*[\\s'"]`).replaceAll("\\:", "[:]").
                replaceAll('_-', "_\\-;").replace('\\s+.*', '.*\\s+').replace(".*\\s*>",".*?>");

            if (regex[index].includes('{')) {
                regex[index] = regex[index].replace(".*\\s+", ".*(\\s+").replace(".*{", ".*){");
            }

            index++;
        }
    } catch (error) {
        // Set RegExp length to 0 in case of an error
        regex = [];
        console.log(error);
    }

    // If the provided CSS selector(s) valid and supported,
    // Create the final RegExp by concatenating all generated RegExps with the OR(|) symbol
    let finalRegex = regex.length ? regex.join('|') : "Unsupported CSS Selector";

    return finalRegex;
}