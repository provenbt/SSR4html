export function convertToRegex(searchText : string) : String{
    const queries : String [] | null= searchText.split(',');
    let regex : string[]= [];
    const s2r = require("selector-2-regexp");

    try {
        let index = 0;
        for(let query of queries){

            const attribute = query.replace('~','').slice(query.indexOf('[')+1, query.lastIndexOf('=')).
            replace('=','').replaceAll(' ', '');

            //query = query.replaceAll(' ','');
            regex[index] = s2r.default(query);

            regex[index] = regex[index].trim().replace("class=","class\\s*=\\s*").
            replace("id=","id\\s*=\\s*").replaceAll("\\:","[:]").replace(`${attribute}=`,`${attribute}\\s*=\\s*`).
            replace(`(${attribute})`, `(${attribute}\\s*=\\s*)`);
            
           if (regex[index] === "" || regex[index].startsWith("(?<")){
                throw new Error("Invalid regular expression detected");
            }

            if (query.match(/^[A-Za-z]+.*/g) !== null){
                let tagName = query.split('[')[0];
                tagName = query.split('.')[0];
                regex[index] = regex[index].replace(`${tagName}`,`(?<!\\w)${tagName}(?!\\w)`);
            }

            if (regex[index].includes('{')){
                regex[index] = regex[index].replace("\\s+", "\\s+(").replace(".*{",".*){");
            }

            index++;
        }
    } catch (error) {
        regex = [];
        console.log(error);
    }
    
    let finalRegex = regex.length ? regex.join('|') : "Invalid Css Selector Command";

    return finalRegex; 
}