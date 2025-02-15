import { ASTItem } from "./parse_tokens";

type func_output = {
    name: string,
    variables: string[],
    arguments: string[],
    calls: string[]
}

const tab = `&nbsp;&nbsp;&nbsp;&nbsp;`;

export default function analyze_ast(ast: ASTItem[]): string {
    let output_string = "";

    let include_paths: string[] = [];
    let function_declarations: func_output[] = [];
    let function_calls: string[] = [];

    ast.forEach((item) => {
        if (item.type == "include_statement") {
            if (!item.file_path) return console.error(`Encountered an include_statement with an undefined file_path property.`);
            include_paths.push(item.file_path || "no path");
        }
        if (item.type == "function_declaration" && item.content) {
            let func: func_output = {
                name: item.content,
                variables: [],
                arguments: [],
                calls: []
            }
            if (!item.children) return console.error(`Error: function ${func.name} has no children.`);

            item.children.forEach((child) => {
                if (child.type == "variable_assignment") {
                    if (!child.content) return console.error(`Error: variable_assignment has no name.`);
                    func.variables.push(child.content);
                }
                if (child.type == "function_call") {
                    if (!child.content) return console.error(`Error: function_call has no name`);
                    func.calls.push(child.content);
                }
            })

            if (item.arguments) {
                item.arguments.forEach((arg) => {
                    if (arg.content) {
                        func.arguments.push(arg.content);
                    }
                })
            }
            function_declarations.push(func);
        }
    })

    // Create output string
    output_string = `## Include Paths:<br />`;
    include_paths.forEach((include_path) => {
        output_string += `${tab}${include_path}<br />`
    })

    output_string += `<br /><br />Function Declarations:<br />`;

    function_declarations.forEach((func) => {
        let arg_string = "";
        func.arguments.forEach((argument) => {
            arg_string += `${argument}, `;
        })
        arg_string = arg_string.substring(0, arg_string.length - 2);

        output_string += `${tab}${func.name} (${arg_string})<br />${tab}${tab}variable assignments:<br />  `;
        func.variables.forEach((variable) => {
            output_string += `${tab}${tab}${tab}-${variable}<br />  `
        })

        output_string += `${tab}${tab}function calls:<br />  `;
        func.calls.forEach((fcall) => {
            output_string += `${tab}${tab}${tab}-${fcall}<br />  `
        })
    })

    return output_string;
}