import fs from "fs";
const input_files = fs.readdirSync(`./input`);

console.log(`[gsc-ast] Attempting to parse input files...`);
input_files.forEach((input_file) => {
    const name = input_file.split(".gsc")[0];
    const input_path = `./input/${input_file}`;
    const output_path = `./output/${name}.json`;
    const content = fs.readFileSync(input_path, { encoding: "utf8" });
    const output = [];

    console.log(`\t${name}[Tokenizer]`)
    // Tokenize content


    console.log(`\t${name}[Parser]`)
    // Parse tokens
    
    console.log(`\t${name}[Main]:`)
    console.log(`\t\tWriting output to file ${output_path}`);
    fs.writeFileSync(output_path, JSON.stringify(output));
})