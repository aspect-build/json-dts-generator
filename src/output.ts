import * as path from "path";
import { TypeDeclaration, typeAlias, identifierRegex } from "./core";

export function typeDeclaration(
  declaration: TypeDeclaration,
  { computed = false, includeContexts = false } = {},
) {
  const name = typeAlias(declaration.id);
  const type = declaration.type;

  let result: string = "";
  if (typeof type === "string") {
    result = type;
  } else {
    const properties: string[] = Object.keys(type).map(key =>
      identifierRegex.test(key)
        ? `${key}: ${type[key]};`
        : `"${key}": ${type[key]};`,
    );

    result = properties.length ? "{ " + properties.join(" ") + " }" : "{}";
  }

  let typeDecl =
    "type " +
    name +
    " = " +
    (computed ? `C<${result}>` : result) +
    ";";

  return includeContexts
    ? typeDecl + " // " + declaration.contexts.join(", ")
    : typeDecl;
}

export function* generateDts(
  declarations: Iterable<TypeDeclaration>,
  exportedType: string | undefined,
  { computed = false, includeContexts = false } = {},
) {
  if (computed) {
    yield `
/**
 * Compute utility which makes resulting types easier to read
 * with IntelliSense by expanding them fully, instead of leaving
 * object properties with cryptic type names.
 */
type C<A extends any> = {[K in keyof A]: A[K]} & {};
    `.trim() + "\n\n";
  }

  for (const declaration of declarations) {
    yield typeDeclaration(declaration, {
      computed: computed,
      includeContexts: includeContexts,
    }) + "\n";
  }

  if (exportedType) {
    yield `
declare const JSON: ${exportedType};
export default JSON;\n`;
  }
}
