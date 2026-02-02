import { ASTItem } from "./parse_tokens.ts";

type function_declaration = {
    name: string;
    arguments: string[];
    variable_assignments: variable_assignment[];
    function_calls: function_call[];
}

type function_call = {
    name: string;
    arguments: string[];
}

type variable_assignment = {
    name: string;
    components: string[]
}

type ASTOutput = {
    include_paths: string[];
    function_declarations: function_declaration[];
    level_variables: string[];
}

export default function analyze_ast(ast: ASTItem[]): ASTOutput {
    const output: ASTOutput = {
        include_paths: [],
        function_declarations: [],
        level_variables: []
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
                            let va: variable_assignment = {
                                name: child.content,
                                components: []
                            }
                            if (child.children) {
                                child.children.forEach((component) => {
                                    if (component.content) va.components.push(component.content);
                                })
                            }

                            // NOTE: Example of AST analysis
                            // Check if level variable, if so write to file
                            if (va.name.substring(0, 5) == "level") {
                                // Check if duplicate
                                if (output.level_variables.indexOf(va.name) == -1) output.level_variables.push(va.name);
                            }

                            func_dec.variable_assignments.push(va);
                        }
                        if (child.type == "function_call" && child.content) {
                            const func_call: function_call = {
                                name: child.content,
                                arguments: []
                            }
                            if (child.arguments) {
                                child.arguments.forEach((argument) => {
                                    if (argument.type == "scope" && argument.children && argument.content) {
                                        // Parse children
                                        let scope_string: string = argument.content[0];
                                        argument.children.forEach((child) => {
                                            if (child.type != "unhandled_token" && child.content) {
                                                scope_string += `${child.content}, `;
                                            }
                                        })
                                        scope_string = scope_string.slice(0, scope_string.length - 2);
                                        scope_string += argument.content[1];
                                        func_call.arguments.push(scope_string);
                                    } else if (argument.content) {
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

    // Check for duplicate level variables
    output.level_variables = [...new Set(output.level_variables)];

    return output;
}
