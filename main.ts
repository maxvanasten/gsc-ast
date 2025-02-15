import fs from "fs";
import Tokenizer from "./tokenizer";

import parse_tokens from "./helpers/parse_tokens";

const input_files = fs.readdirSync(`./input`);

if (!fs.existsSync("./output")) fs.mkdirSync("./output");

console.log(`[gsc-ast] Attempting to parse input files...`);
input_files.forEach((input_file) => {
    const name = input_file.split(".gsc")[0];
    const input_path = `./input/${input_file}`;
    const output_path = `./output/${name}`;

    if (!fs.existsSync(output_path)) {
        fs.mkdirSync(output_path);
    } else {
        fs.rmSync(output_path, { recursive: true, force: true });
        fs.mkdirSync(output_path);
    }

    const content = fs.readFileSync(input_path, { encoding: "utf8" });

    console.log(`\t${name}[Tokenizer]`)
    // Tokenize content
    const tokenizer = new Tokenizer(content);
    const tokens = tokenizer.tokenize();

    let tokens_log_string = "";
    tokens.forEach((token) => {
        if (token.identifier == "identifier") {
            tokens_log_string += `${token.identifier} "${token.content}"\n\t\t\t`
        } else {
            tokens_log_string += `${token.identifier}\n\t\t\t`
        }
    })
    console.log(`\t\tTokens: \n\t\t\t${tokens_log_string}`);

    console.log(`\t\tWriting tokens to ${output_path}/tokens.json`);
    fs.writeFileSync(`${output_path}/tokens.json`, JSON.stringify(tokens));

    console.log(`\n\n\n\n\n\t${name}[Parser]`)
    // Parse tokens
    const ast = parse_tokens(tokens);

    let ast_log_string = "";
    ast.forEach((item) => {
        switch (item.type) {
            case "include_statement":
            case "string":
                ast_log_string += `${item.type} "${item.content}"\n\t\t\t`;
                break;
            case "variable_assignment":
                if (!item.children) break;
                ast_log_string += `${item.type} (${item.children[0].content} = ${item.content})\n\t\t\t`;
                break;
            default:
                ast_log_string += `${item.type}\n\t\t\t`;
        }

    })
    console.log(`\t\tASTItems: \n\t\t\t${ast_log_string}`);

    console.log(`\t\tWriting AST to ${output_path}/ast.json`);
    fs.writeFileSync(`${output_path}/ast.json`, JSON.stringify(ast));
})