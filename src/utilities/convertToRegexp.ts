export function convertToRegex(expression : string) : String {
    const queries : String [] | null= expression.replaceAll(' ','').split(',');
    let regex = [];
    try {
        let index = 0;
        for(let query of queries){
            
            query = query.replaceAll(`"`,`"""`);
            const command = `s2r "${query}`;

            const {execSync} = require("child_process");
            regex[index] = execSync(command).toString().trim().replaceAll("class=","class\\s*=\\s*").replaceAll("id=","id\\s*=\\s*").replaceAll("\\:","[:]");

            if (regex[index] === "" || regex[index].startsWith("(?<")){
                throw new Error("Look behind assertion is detected");
            }

            index++;
        }
    } catch (error) {
        regex = [];
        console.log(error);
    }
    
    let finalRegex = regex.length ? regex.join('|') : "Invalid Css Selector Command";
    if(queries[0][0] !== '.'){
        finalRegex = finalRegex.replace(`${queries[0].split('.')[0]}`,`(?<!\\w)${queries[0].split('.')[0]}(?!\\w)`);
    }

    return finalRegex; 
}