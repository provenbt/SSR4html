export function convertToRegex(searchText : string) : String {
    const queries : String [] | null= searchText.split(',');
    let regex = [];

    try {
        let index = 0;
        for(let query of queries){

            const attribute = query.replace('~','').slice(query.indexOf('[')+1, query.lastIndexOf('=')).
            replace('=','').replaceAll(' ', '');

            query = query.replaceAll(' ','').replaceAll(`"`,`"""`);
            const command = `s2r "${query}"`;

            const {execSync} = require("child_process");
            regex[index] = execSync(command).toString().trim().replace("class=","class\\s*=\\s*").
            replace("id=","id\\s*=\\s*").replaceAll("\\:","[:]").replace(`${attribute}=`,`${attribute}\\s*=\\s*`).
            replace(`(${attribute})`, `(${attribute}\\s*=\\s*)`);

           if (regex[index] === "" || regex[index].startsWith("(?<")){
                throw new Error("Invalid regular expression detected");
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