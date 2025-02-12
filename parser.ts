import { Token } from "./tokenizer";

export type ASTItem = {
    identifier: string;
    content?: string;
    children?: ASTItem[];
}

export type MatchResult = {
    valid: boolean;
    tokens: Token[];
}

export default class Parser {
    input: Token[];

    index: number = 0;

    ast: ASTItem[] = [];

    constructor(tokens: Token[]) {
        this.input = tokens;
    }

    parse(): ASTItem[] {
        while (this.index < this.input.length) {
            // console.log(`Index: ${this.index}`)
            let result;
            switch (this.input[this.index].identifier) {
                case "#include":
                    result = this.get_match(["#include", "identifier", ";"]);
                    if (!result.valid) break;
                    this.ast.push({
                        identifier: "include_statement",
                        content: result.tokens[1].content
                    })
                    break;
                case "'":
                case '"':
                case "`": {
                    result = this.get_until(this.input[this.index].identifier);
                    if (!result.valid) break;

                    // Stringify token array
                    let string = "";
                    result.tokens.forEach((token) => {
                        if (token.content) {
                            string += token.content;
                        } else {
                            string += token.identifier;
                        }
                    })

                    this.ast.push({
                        identifier: "string",
                        content: string
                    })
                    break;
                }
                case "=": {
                    // Check if previous token is identifier
                    if (this.index <= 0) break;
                    if (this.input[this.index - 1].identifier != "identifier") break;

                    // Store variable name
                    let children: ASTItem[] = [];
                    children.push({
                        identifier: "variable_name",
                        content: this.input[this.index-1].content?.replaceAll(" ", "")
                    })

                    // Get tokens until terminator
                    result = this.get_until(";");
                    if (!result.valid) break;

                    // Add tokens to children
                    result.tokens.forEach((token) => {
                        children.push({
                            identifier: "assignment",
                            content: token.content || token.identifier
                        })
                    })

                    // Stringify token array
                    // TODO: Parse token array
                    // NOTE: After parsing file, loop through applicable ASTItems and parse their contents and where applicable, their contents.

                    let string = "";
                    result.tokens.forEach((token) => {

                        if (token.content) {
                            string += token.content;
                        } else {
                            string += token.identifier;
                        }
                    })
                    this.ast.push({
                        identifier: "variable_assignment",
                        content: string,
                        children: children
                    })

                    break;
                }
                default:
                    this.index++;
            }
        }

        return this.ast;
    }

    get_match(target: string[]): MatchResult {
        let result: MatchResult = {
            valid: false,
            tokens: []
        }
        let search_buffer: string[] = [];
        let search_index = this.index;
        let checks = 0;

        while (search_index < this.input.length && checks < target.length) {
            checks++;
            search_buffer.push(this.input[search_index].identifier);
            result.tokens.push(this.input[search_index]);
            search_index++;
        }

        // console.log(`Search buffer: ${search_buffer}, Target: ${target}`)

        result.valid = true;
        for (let i = 0; i < target.length; i++) {
            if (target[i] != search_buffer[i]) result.valid = false;
        }

        if (result.valid) {
            this.index = search_index;
            return result;
        }

        this.index++;
        return result;
    }

    get_until(target: string): MatchResult {
        let result: MatchResult = {
            valid: false,
            tokens: []
        }

        let search_index = this.index + 1;

        while (search_index < this.input.length && !result.valid) {
            if (this.input[search_index].identifier == target) result.valid = true;

            result.tokens.push(this.input[search_index]);

            search_index++;

        }

        if (result.valid) {
            this.index = search_index;
            result.tokens.splice(result.tokens.length - 1, 1);
            return result;
        }

        this.index++;
        return result;
    }
}