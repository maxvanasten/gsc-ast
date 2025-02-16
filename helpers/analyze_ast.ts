import { ASTItem } from "./parse_tokens";

type function_declaration = {
    name: string;
    arguments: string[];
    variable_assignments: string[];
    function_calls: function_call[];
}

type function_call = {
    name: string;
    arguments: string[];
}

type ASTOutput = {
    include_paths: string[];
    function_declarations: function_declaration[];
}

export default function analyze_ast(ast: ASTItem[]): ASTOutput {
    const output: ASTOutput = {
        include_paths: [],
        function_declarations: [],
    }

    ast.forEach((ast_item) => {
        switch (ast_item.type) {
            case "include_statement": {
                if (!ast_item.file_path) break;
                output.include_paths.push(ast_item.file_path);
                break;
            }
            case "function_declaration": {
                if (!ast_item.content) break;
                const func_dec: function_declaration = {
                    name: ast_item.content,
                    arguments: [],
                    variable_assignments: [],
                    function_calls: []
                }

                if (ast_item.arguments) {
                    ast_item.arguments.forEach((argument) => {
                        if (argument.content) {
                            func_dec.arguments.push(argument.content);
                        }
                    })
                }

                if (ast_item.children) {
                    ast_item.children.forEach((child) => {
                        if (child.type == "variable_assignment" && child.content) {
                            func_dec.variable_assignments.push(child.content);
                        }
                        if (child.type == "function_call" && child.content) {
                            const func_call: function_call = {
                                name: child.content,
                                arguments: []
                            }
                            if (child.arguments) {
                                child.arguments.forEach((argument) => {
                                    if (argument.content) {
                                        func_call.arguments.push(argument.content);
                                    }
                                })
                            }
                            func_dec.function_calls.push(func_call);
                        }
                    })
                }

                output.function_declarations.push(func_dec);
                break;
            }
        }
    })

    return output;
}