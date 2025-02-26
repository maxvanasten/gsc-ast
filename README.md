# GSC-AST

## About

This is a project to turn GSC scripts (from Plutonium T6 specifically) into an Abstract Syntax Tree.
GSC-AST is far from functional, currently its just a proof of concept. The end goal of GSC-AST is to parse all of the dumped T6 scripts into an AST either for use in a language server or other analysis such as finding out every possible level variable and wait_till flag.

## TODO

- For loops, while loops, switch statements, if statements
- Origin/Color values `(x, y, z)`

## Usage

Input files in `./input` are parsed and the results will be outputted to `./output/<name>`. Simply clone the repository, run `npm i` in the directory and then you can run GSC-AST by running `npm start`.

## Demo

The [0_all.gsc](https://github.com/maxvanasten/gsc-ast/blob/main/input/0_all.gsc) file serves as a demonstration of the current capabilities of GSC-AST. Its output can be found in [output/0_all/](https://github.com/maxvanasten/gsc-ast/tree/main/output/0_all). GSC-AST exports tokens, an abstract syntax tree and a human readable analysis of the input code.

GSC-AST is currently in a state where it can analyze dumped T6 scripts, it doesn't fully parse them correctly yet but you can view an example in [testing](https://github.com/maxvanasten/gsc-ast/tree/main/output/demo_0).
