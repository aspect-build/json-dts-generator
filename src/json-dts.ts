#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import {
  convertToType,
  createCache,
  typeAlias,
  JSONValue,
  TypeDeclaration,
} from "./core";
import { generateDts } from "./output";

if (module.parent) {
  throw new Error(
    "This file should be run as a script, not imported as a module.",
  );
}

const USAGE = `Usage: node ${path.basename(__filename)} <input_file> <output_file>`;
const INSTRUCTIONS = `
Reads a json input file and outputs a corresponding TS declaration file.
`.trim();

const UNKNOWN_ARRAY_WARNING = (declarations: TypeDeclaration[]) => {
  const unfinishedTypeAliases = declarations
    .map(
      ({ id, contexts }) =>
        `  type ${typeAlias(id)}, derived from ${contexts[0]}`,
    )
    .join("\n");

  return `
The proper array type for the following type aliases could not be
inferred because the provided JSON featured empty arrays:

${unfinishedTypeAliases}

These type aliases have been given the type "unknown[]". Opening
the output file and manually providing the proper types is recommended.
  `.trim();
};

function readJSONSync(file: string): JSONValue {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

if (process.argv.length === 3 && ["-h", "--help"].includes(process.argv[2])) {
  console.log(USAGE + "\n\n" + INSTRUCTIONS);
  process.exit(0);
}

if (process.argv.length !== 4) {
  console.error(USAGE);
  process.exit(1);
}

const inputFile = path.resolve(process.cwd(), process.argv[2]);
const outputFile = path.resolve(process.cwd(), process.argv[3]);

console.log("Parsing JSON file...");

const json = readJSONSync(inputFile);
const result = convertToType(createCache(), json, path.basename(inputFile));

console.log(`Creating ${outputFile} file...`);

mkdirp.sync(path.dirname(outputFile));

const output = fs.createWriteStream(outputFile);
for (const line of generateDts(result.cache.map.values(), result.type, {
  computed: true,
  includeContexts: true,
})) {
  output.write(line);
}
output.close();

const unknownArrays: TypeDeclaration[] = [];
for (const declaration of result.cache.map.values()) {
  if (declaration.type === "unknown[]") {
    unknownArrays.push(declaration);
  }
}

console.log(`${outputFile} created successfully.`);

if (unknownArrays.length) {
  console.log("\n" + UNKNOWN_ARRAY_WARNING(unknownArrays));
}
