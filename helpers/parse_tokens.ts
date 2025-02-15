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

    while (index < tokens.length) {
        console.log(`[${index} / ${tokens.length}] token: ${tokens[index].identifier}, (${tokens[index].content})`);
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
                // Check if previous token is identifier
                if (index <= 0) {
                    index++;
                    break;
                }

                if (tokens[index - 1].identifier == "identifier") {
                    const variable_name: string = tokens[index - 1].content?.replaceAll(" ", "") || "undefined"

                    // Get tokens until terminator
                    let result = get_until_token(tokens, ";", index);
                    if (!result.valid) break;
                    index = result.index;

                    // Check if previous item in ast is variable_reference
                    if (output.length > 0) {
                        if (output[output.length - 1].type == "variable_reference") {
                            output.splice(output.length - 1, 1);
                        }
                    }

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
            case "(": {
                if (index <= 0) {
                    index++;
                    break;
                }

                if (tokens[index - 1].identifier == "identifier") {
                    const function_name: string = tokens[index - 1].content;
                    // Get tokens until )
                    const result = get_until_token(tokens, ")", index);
                    if (!result.valid) break;
                    index = result.index;

                    // Check to delete potential previously added variable_reference
                    if (output.length > 0) {
                        if (output[output.length - 1].type == "variable_reference") {
                            output.splice(output.length - 1, 1);
                        }
                    }

                    let func_ast = parse_tokens(result.tokens);
                    func_ast.forEach((item) => {
                        if (item.type == "unhandled_token" && item.content == ",") {
                            func_ast.splice(func_ast.indexOf(item), 1);
                        }
                    })
                    output.push({
                        type: "function_call",
                        content: function_name,
                        children: func_ast
                    })
                } else {
                    index++;
                }

                break;
            }
            case "+":
            case "-":
            case ">":
            case "<":
            case "/":
            case "*": {
                if (tokens[index].identifier == "/") {
                    // Check if not a comment
                    if (index + 1 < tokens.length) {
                        if (tokens[index + 1].identifier == "/") {
                            // Comment until newline
                            let result = get_until_token(tokens, "newline", index);
                            if (result.valid) {
                                index = result.index;

                                output.push({
                                    type: "comment",
                                    content: result.tokens[1].content
                                })
                                break;
                            }
                        }
                    }
                }

                output.push({
                    type: "math_operator",
                    content: tokens[index].identifier
                })
                index++;
                break;
            }
            // case ",":
            //     output.push({
            //         type: "comma_separator",
            //         content: ""
            //     })
            //     index++;
            //     break;
            // case "(":
            //     output.push({
            //         type: "l_paren",
            //         content: ""
            //     })
            //     index++;
            //     break;
            // case ")":
            //     output.push({
            //         type: "r_paren",
            //         content: ""
            //     })
            //     index++;
            //     break;
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
            case "newline": {
                output.push({
                    type: "newline",
                    content: ""
                })
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