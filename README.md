# json-dts-generator

Generate TS declaration files from JSON files. Suitable for both small and large datasets.

## Usage

Install it globally:

```
$ npm i -g json-dts-generator
$ json-dts-generator <input_json> <output_dts>
```

Or use `npx`:

```
$ npx json-dts-generator <input_json> <output_dts>
```

## Purpose

Reads the input json file, parses each into a TS declarations and outputs a dts file.

## Pitfalls

- Cannot infer proper types for empty arrays. The script will warn you if it runs into any of these so that you can fix them manually.
