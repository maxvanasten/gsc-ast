#!/usr/bin/env -S deno --allow-read --allow-write
if (Deno.args.length < 2) {
  console.error(
    "Incorrect usage, proper usage: ./main.ts input.gsc output_folder/",
  );
  Deno.exit(1);
}

const flags = Deno.args.slice(2);

const options = {
  tokens: false,
  ast: true,
  analyze: false,
  level_variables: false,
};

flags.forEach((flag) => {
  switch (flag) {
    case "tokens":
      options.tokens = true;
      break;
    case "ast":
      options.ast = true;
      break;
    case "analyze":
      options.analyze = true;
      break;
    case "level_variables":
      options.level_variables = true;
      break;
  }
});

import Tokenizer from "./modules/tokenizer.ts";

import parse_tokens, { ASTItem } from "./modules/parse_tokens.ts";

import analyze_ast from "./modules/analyze_ast.ts";
import sanitize_ast from "./modules/sanitize_ast.ts";

const name = Deno.args[0].split(".gsc")[0];
const input_path = Deno.args[0];
const output_path = Deno.args[1];

const content = Deno.readFileSync(input_path);

const tokenizer = new Tokenizer(new TextDecoder().decode(content));
const tokens = tokenizer.tokenize();

let tokens_log_string = "";
tokens.forEach((token) => {
  if (token.identifier == "identifier") {
    tokens_log_string += `${token.identifier} "${token.content}"\n\t\t\t`;
  } else {
    tokens_log_string += `${token.identifier}\n\t\t\t`;
  }
});

if (options.tokens) {
  Deno.writeFileSync(
    `${output_path}/tokens.json`,
    new TextEncoder().encode(JSON.stringify(tokens, null, 2)),
  );
}

const ast = sanitize_ast(parse_tokens(tokens));
ast.forEach((item) => {
  if (item.arguments) {
    item.arguments = sanitize_ast(item.arguments);
  }
  if (item.children) {
    item.children = sanitize_ast(item.children);
  }
});

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
      });
      ast_log_string += `\n\t\t\t`;
      break;
    default:
      ast_log_string += `${item.type}\n\t\t\t`;
  }
});

if (options.ast) {
  Deno.writeFileSync(
    `${output_path}/ast.json`,
    new TextEncoder().encode(JSON.stringify(ast, null, 2)),
  );
}

if (options.analyze) {
  const analysis = analyze_ast(ast);

  if (options.level_variables) {
    let level_variables_str = `# Level Variables\n\n### ${name}\n\n`;
    analysis.level_variables.forEach((l_var) => {
      level_variables_str += `- ${l_var}\n`;
    });

    Deno.writeFileSync(
      `${output_path}/level_variables.md`,
      new TextEncoder().encode(level_variables_str),
    );
  }

  Deno.writeFileSync(
    `${output_path}/output.json`,
    new TextEncoder().encode(JSON.stringify(analysis, null, 2)),
  );
}
