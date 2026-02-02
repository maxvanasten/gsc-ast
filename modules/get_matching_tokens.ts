import { Token } from "./tokenizer.ts";

export type MatchResult = {
    valid: boolean;
    tokens: Token[];
    index: number;
}

export default function get_matching_tokens(input_tokens: Token[], targets: string[], index: number): MatchResult {
    let result: MatchResult = {
        valid: false,
        tokens: [],
        index: index
    }
    let search_buffer: string[] = [];
    let checks: number = 0;

    while (result.index <= input_tokens.length && checks < targets.length) {
        checks++;
        search_buffer.push(input_tokens[result.index].identifier);
        result.tokens.push(input_tokens[result.index]);
        result.index++;
    }

    result.valid = true;
    for (let i = 0; i < targets.length; i++) {
        if (targets[i] != search_buffer[i]) result.valid = false;
    }

    if (result.valid) {
        return result;
    }

    result.index++;
    return result;
}
