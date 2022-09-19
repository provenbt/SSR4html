export function convertToRegex(searchText : string) : String{
    const queries : string [] | null= searchText.split(',');
    let regex : string[]= [];
    const s2r = require("selector-2-regexp");

    try {
        let index = 0;
        for(let query of queries){
            
            query = query.trim();
            if(query.includes('|') || /^[^A-Za-z#\[.]/g.test(query)){
                throw new Error("Unsupported selector command detected");
            }
            
            regex[index] = s2r.default(query);

            if (regex[index].startsWith("(?<")){
                throw new Error("Invalid regular expression detected");
            }
            
            if (query.includes('[')){
                let re = /\[\s*(.+?)\s*(\=|\])/g;

                let attributes = [];
                let m;
    
                while ((m = re.exec(query)) !== null) {
                    attributes.push(m[0]);
                }

                for(let attribute of attributes){

                    attribute = attribute.replaceAll(/[\^\$\*\~\[\]\=]/g,'').trim();

                    if(attribute !== "id" && attribute !== "class"){
                        regex[index] = regex[index].replace(`${attribute}=`, `${attribute}`).
                        replace(`${attribute}`, `${attribute}=`).
                        replace(`${attribute}=`,`${attribute}\\s*=\\s*`);
                    }
                }
            }


            regex[index] = regex[index].replace("class=","class\\s*=\\s*").
            replace("id=","id\\s*=\\s*").replaceAll(`.*[\\s'"]`, `[^=]*[\\s'"]`).
            replaceAll("\\:","[:]").replaceAll('_-', "_\\-;").replace('\\s+.*','.*\\s+');

            if (query.match(/^[A-Za-z]+.*/g) !== null){
                let tagName = query.split(/[#\[.]/g)[0];
                tagName = query.split(/[#\[.]/g)[0];
    
                regex[index] = regex[index].replace(`${tagName}`,`(?<!\\w)${tagName}(?!\\w)`);
            }

            if (regex[index].includes('{')){
                regex[index] = regex[index].replace(".*\\s+", ".*(\\s+").replace(".*{",".*){");
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