export type Token = {
    // identifier: "string" | "identifier" | "#include" | ";" | "(" | ")" | "{" | "}" | "[" | "]" | "=" | "-" | "+" | "*" | "/" | "!";
    identifier: string;
    content?: string;
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
                    this.add_identifier();
                    this.add_token(this.current_char);
                    break;
                case "'":
                case '"':
                    // case "`":
                    this.add_identifier();
                    this.add_token(this.current_char);
                    break;
                case "#": {
                    let result = this.get_match("#include");
                    if (!result) break;
                    this.add_identifier();
                    this.add_token("#include");
                    break;
                }
                case "\n":
                case "\t":
                case "\r":
                    break;
                default:
                    this.buffer += this.current_char;
            }

            this.index++;
            this.current_char = this.input[this.index];
        }

        return this.tokens;
    }

    add_token(identifier: string, content?: string) {
        this.tokens.push({
            identifier: identifier,
            content: content || ""
        })
    }

    add_identifier() {
        if (!this.buffer.length) return;

        this.tokens.push({
            identifier: "identifier",
            content: this.buffer
        })
        this.buffer = "";
    }

    get_match(target: string): boolean {
        let search_buffer = "";
        let search_index = this.index;
        let checks = 0;

        // console.log(`Search index: ${search_index}, Input length: ${this.input.length}, Target length: ${target.length}`)

        while (search_index <= this.input.length && checks < target.length) {
            checks++;
            search_buffer += this.input[search_index];
            search_index++;
            // console.log(`search_buffer: ${search_buffer} (target: ${target}) [${search_buffer == target}]`);
        }

        if (search_buffer == target) {
            this.index = search_index;
            this.current_char = this.input[this.index];

            return true;
        } else {
            return false;
        }
    }
}