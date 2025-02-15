# GSC-AST

## About

This is a project to turn GSC scripts (from Plutonium T6 specifically) into an Abstract Syntax Tree.
GSC-AST is far from functional, currently its just a proof of concept. The end goal of GSC-AST is to parse all of the dumped T6 scripts into an AST for use in a language server.

## Demo

The `./input/0_all.gsc` file serves as a demonstration of the current capabilities of GSC-AST. Its output can be found in `./output/0_all`. GSC-AST exports tokens, an abstract syntax tree and a human readable analysis of the input code.

## Current coverage

- Numbers (number)
- Strings (string)
- Math operators (math_operator)
- Include statements (include_statement)
- Variable reference (variable_reference)
- Variable assignment (variable_assignment)
- Comment (comment)
- Function calls
- Function declarations
- Unhandled (unhandled_token)