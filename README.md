# GSC-AST

## About

This is a project to turn GSC scripts (from Plutonium T6 specifically) into an Abstract Syntax Tree.
GSC-AST is far from functional, currently its just a proof of concept.

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
        "identifier": "include_statement",
        "content": "common_scripts\\utility"
    },
    {
        "identifier": "include_statement",
        "content": "maps\\mp\\gametypes_zm\\_hud_util"
    },
    {
        "identifier": "include_statement",
        "content": "maps\\mp\\zombies\\_zm_utility"
    },
    {
        "identifier": "include_statement",
        "content": "some_script"
    },
    {
        "identifier": "string",
        "content": "test_st'ring_1"
    },
    {
        "identifier": "string",
        "content": "test_s{}$$%$tring_2"
    }
]
```
