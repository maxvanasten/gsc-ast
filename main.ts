#!/usr/bin/env -S deno --allow-read --allow-write
import Tokenizer from "./modules/tokenizer.ts";

import parse_tokens, { ASTItem } from "./modules/parse_tokens.ts";

import analyze_ast from "./modules/analyze_ast.ts";
import sanitize_ast from "./modules/sanitize_ast.ts";

const input_files = Deno.readDirSync(`./input`);

if (!Deno.openSync("./output")) Deno.mkdirSync("./output");

//console.log(`[gsc-ast] Attempting to parse input files...`);
input_files.forEach((input_file) => {
    const name = input_file.name.split(".gsc")[0];
    const input_path = `./input/${input_file.name}`;
    const output_path = `./output/${name}`;

    if (!Deno.openSync(output_path)) {
        Deno.mkdirSync(output_path);
    } else {
        Deno.removeSync(output_path, { recursive: true });
        Deno.mkdirSync(output_path);
    }

    const content = Deno.readFileSync(input_path);

    //console.log(`=========================================================\n\t${name}[Tokenizer]`)
    // Tokenize content
    const tokenizer = new Tokenizer(new TextDecoder().decode(content));
    const tokens = tokenizer.tokenize();

    let tokens_log_string = "";
    tokens.forEach((token) => {
        if (token.identifier == "identifier") {
            tokens_log_string += `${token.identifier} "${token.content}"\n\t\t\t`
        } else {
            tokens_log_string += `${token.identifier}\n\t\t\t`
        }
    })
    //console.log(`\t\tTokens: \n\t\t\t${tokens_log_string}`);

    //console.log(`\t\tWriting tokens to ${output_path}/tokens.json`);
    Deno.writeFileSync(`${output_path}/tokens.json`, new TextEncoder().encode(JSON.stringify(tokens, null, 2)));

    //console.log(`\n\n\n\n\n\t${name}[Parser]`)
    // Parse tokens
    const ast = sanitize_ast(parse_tokens(tokens));
    ast.forEach((item) => {
        if (item.arguments) {
            item.arguments = sanitize_ast(item.arguments);
        }
        if (item.children) {
            item.children = sanitize_ast(item.children);
        }
    })

    let ast_log_string = "";
    ast.forEach((item) => {
        switch (item.type) {
            case "newline":
                ast.splice(ast.indexOf(item), 1);
                break;
            case "include_statement":
            case "string":
            case "variable_reference":
                ast_log_string += `${item.type} "${item.content}"\n\t\t\t`;
                break;
            case "variable_assignment":
                if (!item.arguments) break;
                ast_log_string += `${item.type} (variable_name: ${item.content})\n`;
                // Get rest of children
                item.arguments.forEach((child: ASTItem) => {
                    ast_log_string += `\t\t\t\t${child.type}: ${child.content}\n`;
                })
                ast_log_string += `\n\t\t\t`;
                break;
            default:
                ast_log_string += `${item.type}\n\t\t\t`;
        }

    })
    //console.log(`\t\tASTItems: \n\t\t\t${ast_log_string}`);

    //console.log(`\t\tWriting AST to ${output_path}/ast.json`);
    Deno.writeFileSync(`${output_path}/ast.json`, new TextEncoder().encode(JSON.stringify(ast, null, 2)));

    const analysis = analyze_ast(ast);

    let level_variables_str = `# Level Variables\n\n### ${name}\n\n`;
    analysis.level_variables.forEach((l_var) => {
        level_variables_str += `- ${l_var}\n`;
    })

    Deno.writeFileSync(`${output_path}/level_variables.md`, new TextEncoder().encode(level_variables_str));

    Deno.writeFileSync(`${output_path}/output.json`, new TextEncoder().encode(JSON.stringify(analysis, null, 2)));
})
