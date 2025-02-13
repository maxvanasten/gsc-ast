# GSC-AST

## About

This is a project to turn GSC scripts (from Plutonium T6 specifically) into an Abstract Syntax Tree.
GSC-AST is far from functional, currently its just a proof of concept. The end goal of GSC-AST is to parse all of the dumped T6 scripts into an AST for use in a language server.

## Demo

GSC-AST can currently take a .gsc file with the following contents:

```c
#include common_scripts\utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm_utility;
#include some_script;

"test_st'ring_1";
'test_s{}#$#$%$tring_2';
```

and correctly parse it into the following AST:

```json
[
    {
        "type": "include_statement",
        "file_path": "common_scripts\\utility"
    },
    {
        "type": "include_statement",
        "file_path": "maps\\mp\\gametypes_zm\\_hud_util"
    },
    {
        "type": "include_statement",
        "file_path": "maps\\mp\\zombies\\_zm_utility"
    },
    {
        "type": "include_statement",
        "file_path": "some_script"
    },
    {
        "type": "string",
        "content": "test_st'ring_1"
    },
    {
        "type": "string",
        "content": "test_s{}$$%$tring_2"
    }
]
```
