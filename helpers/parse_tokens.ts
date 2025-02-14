import { Token } from "../tokenizer";
import get_matching_tokens from "./get_matching_tokens";
import get_until_token from "./get_until_token";

export type ASTItem = {
    type: string;
    content?: string;
    children?: ASTItem[];
    file_path?: string;
}

export default function parse_tokens(tokens: Token[]): ASTItem[] {
    let index: number = 0;
    let output: ASTItem[] = [];

    let delete_list: ASTItem[] = [];

    while (index < tokens.length) {
        // console.log(`${index} / ${tokens.length}`)
        // console.log(`[${tokens[index].identifier}]`);
        switch (tokens[index].identifier) {
            case "#include": {
                let result = get_matching_tokens(tokens, ["#include", "identifier", ";"], index);
                if (!result.valid) break;
                index = result.index;
                output.push({
                    type: "include_statement",
                    file_path: result.tokens[1].content
                })
                break;
            }
            case "'":
            case '"': {
                let result = get_until_token(tokens, tokens[index].identifier, index);
                if (!result.valid) break;
                index = result.index;

                // Stringify token array
                let string = "";
                result.tokens.forEach((token) => {
                    if (token.content) {
                        string += token.content;
                    } else {
                        string += token.identifier;
                    }
                })

                output.push({
                    type: "string",
                    content: string
                })

                // If next token is a terminator, remove it from tokens
                if (index < tokens.length) {
                    if (tokens[index].identifier == ";") {
                        tokens.splice(index, 1);
                    }
                }
                break;
            }
            case "=": {
                // Check if previous item in ast is variable_reference
                if (output[output.length-1].type == "variable_reference") {
                    output.splice(output.length-1, 1);
                }

                // Check if previous token is identifier
                if (index <= 0) break;
                console.log(`parse_tokens: previous token: ${tokens[index - 1].identifier}, (${tokens[index - 1].content})`)

                if (tokens[index - 1].identifier == "identifier" || tokens[index - 1].identifier == "variable_reference") {
                    const variable_name: string = tokens[index - 1].content?.replaceAll(" ", "") || "undefined"

                    // Get tokens until terminator
                    let result = get_until_token(tokens, ";", index);
                    if (!result.valid) break;
                    index = result.index;

                    output.push({
                        type: "variable_assignment",
                        // Variable name
                        content: variable_name,
                        // Tokens on right side of = excluding terminator
                        children: parse_tokens(result.tokens)
                    })
                } else {
                    index++;
                }

                break;
            }
            case "+":
            case "-":
            case "/":
            case "*": {
                output.push({
                    type: "math_operator",
                    content: tokens[index].identifier
                })
                index++;
                break;
            }
            case "identifier": {
                if (isNaN(+tokens[index].content)) {
                    // Variable reference
                    output.push({
                        type: "variable_reference",
                        content: tokens[index].content.replaceAll(" ", "")
                    })
                } else {
                    // Number
                    output.push({
                        type: "number",
                        content: tokens[index].content.replaceAll(" ", "")
                    })
                }
                index++;
                break;
            }
            default:
                output.push({
                    type: "unhandled_token",
                    content: tokens[index].identifier,
                    children: [
                        {
                            type: "content",
                            content: tokens[index].content || ""
                        }
                    ]
                })
                index++
        }
    }

    return output;
}