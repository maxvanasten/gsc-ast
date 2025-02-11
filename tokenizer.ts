export type Token = {
    identifier: "string" | "identifier" | "#include" | ";" | "(" | ")" | "{" | "}" | "[" | "]" | "=" | "-" | "+" | "*" | "/" | "!";
}

export default class Tokenizer {
    input: string;
    
    index: number = 0;
    current_char: string = "";
    buffer: string = "";

    tokens: Token[] = [];

    constructor(input: string) {
        this.input = input;
        this.current_char = this.input[this.index];
    }

    tokenize(): Token[] {
        while (this.index <= this.input.length) {
            switch (this.current_char) {
                case ";":
                case "(":
                case ")":
                case "{":
                case "}":
                case "[":
                case "]":
                case "=":
                case "-":
                case "+":
                case "*":
                case "/":
                case "!":
                    this.tokens.push({
                        identifier: this.current_char
                    })
                    break;
                case "#":
                    const result = this.get_match("#include");
                    if (!result) break;
                    this.tokens.push({
                        identifier: "#include"
                    })
            }
    
            this.index++;
            this.current_char = this.input[this.index];
        }

        return this.tokens;
    }

    get_match(target: string): boolean {
        let search_buffer = "";
        let search_index = this.index;
        
        while(search_index <= this.input.length && search_index < target.length) {
            search_buffer += this.input[search_index];
            search_index++;
            // console.log(`search_buffer: ${search_buffer} (target: ${target}) [${search_buffer == target}]`);
        }

        if (search_buffer == target) return true;
        return false;
    }
}