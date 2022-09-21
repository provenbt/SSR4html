export function convertToRegex(searchText : string) : String{
    const queries : string [] | null= searchText.split(',');
    let regex : string[]= [];
    const s2r = require("selector-2-regexp");

    try {
        let index = 0;
        for(let query of queries){
            
            query = query.trim();
            if( query.includes('|') || /^[^A-Za-z#\[.]/g.test(query) || (!query.includes('[') && (query.includes(' ') || query.includes(':'))) ){
                throw new Error("Unsupported CSS selector");
            }
            
            regex[index] = s2r.default(query);

            if (regex[index].startsWith("(?<")){
                throw new Error("Invalid regular expression detected");
            }

            if (query.match(/^[A-Za-z]+.*/g) !== null){
                let tagName = query.split(/[#\[.]/g)[0];
                tagName = query.split(/[#\[.]/g)[0];
    
                regex[index] = regex[index].replace(`${tagName}`,`(?<!\\w)${tagName}(?!\\w)`);
            }
            
            if (query.includes('[')){
                const findAttributes = /\[\s*(.+?)\s*(\=|\])/g;

                const attributes = [];
                let m;
    
                while ((m = findAttributes.exec(query)) !== null) {
                    attributes.push(m[0]);
                }

                for(let attribute of attributes){

                    attribute = attribute.replace(/[\^\$\*\~\[\]\=]/g,'').trim();

                    if(attribute !== "id" && attribute !== "class"){
                        regex[index] = regex[index].replace(`${attribute}=`, `${attribute}`).
                        replace(`${attribute}`, `${attribute}=`).
                        replace(`${attribute}=`,`${attribute}\\s*=\\s*`);
                    }
                }
                
                if (query.includes("$=") || query.includes("^=")){

                    const attributeQueries = query.split('[');
                    attributeQueries.shift();

                    for(let atrQuery of attributeQueries){
                        let value = atrQuery.slice(atrQuery.indexOf('=')+1, atrQuery.indexOf(']'));
                        value = value.trim().replace(/"|'/g, '');
                    
                        if (atrQuery.includes("$=")){
                            regex[index] = regex[index].replace(`${value}[\\s`, `${value}[`);
                        } else if(atrQuery.includes("^=")){
                            regex[index] = regex[index].replace(`[\\s'"]${value}`, `['"]${value}`);
                        }
                    }
                }
            }

            regex[index] = regex[index].replace("class=","class\\s*=\\s*").
            replace("id=","id\\s*=\\s*").replaceAll(`.*[\\s'"]`, `[^=]*[\\s'"]`).
            replaceAll("\\:","[:]").replaceAll('_-', "_\\-;").replace('\\s+.*','.*\\s+');

            if (regex[index].includes('{')){
                regex[index] = regex[index].replace(".*\\s+", ".*(\\s+").replace(".*{",".*){");
            }

            index++;
        }
    } catch (error) {
        regex = [];
        console.log(error);
    }
    
    let finalRegex = regex.length ? regex.join('|') : "Invalid Css Selector";

    return finalRegex; 
}