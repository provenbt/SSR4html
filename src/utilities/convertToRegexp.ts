export function convertToRegex(expression : string) : String {
    const queries : String [] | null= expression.replaceAll(' ','').split(',');
    let regex = [];
    let index = 0;

    for(let query of queries){
        const command = `s2r ${query}`;
        try {
            const {execSync} = require("child_process");
            regex[index] = execSync(command).toString().trim().replaceAll("class=","class\\s*=\\s*").replaceAll("id=","id\\s*=\\s*");
        } catch (error) {
            console.log(error);
        }
        index++;
    }

    regex[0] = regex.join('|');
    return (regex[0]); 
}