import { Token } from "../tokenizer";
import { MatchResult } from "./get_matching_tokens";

export default function get_until_token(input_tokens: Token[], target_token_identifier: string, index: number) {
    let result: MatchResult = {
        valid: false,
        tokens: [],
        index: index + 1
    }

    while (result.index < input_tokens.length && !result.valid) {
        if (input_tokens[result.index].identifier == target_token_identifier) result.valid = true;
        result.tokens.push(input_tokens[result.index]);
        result.index++;
    }

    if (result.valid) {
        result.tokens.splice(result.tokens.length - 1, 1);
        return result;
    }

    result.index++;

    console.log(`[get_until_token] index: ${result.index}, tokens_length: ${result.tokens.length}`);

    return result;
}