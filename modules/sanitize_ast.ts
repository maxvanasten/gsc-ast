import { ASTItem } from "./parse_tokens.ts";

export default function sanitize_ast(ast: ASTItem[]): ASTItem[] {
    for (let i = ast.length-1; i >= 0; i--) {
        
        if (ast[i].type == "unhandled_token") {
            if (ast[i].content == "newline" || ast[i].content == ";") {
                ast.splice(i, 1);
            }
        } else if (ast[i].type == "number" && !ast[i].content) {
            ast.splice(i, 1);
        }  

    }

    return ast;
}
