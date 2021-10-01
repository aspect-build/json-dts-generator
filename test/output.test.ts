import { TypeDeclaration, Type } from "../src/core";
import { typeDeclaration, generateDts } from "../src/output";

describe("typeDeclaration()", () => {
  const declaration = (
    id: number,
    type: Type,
    contexts: string[] = [],
  ): TypeDeclaration => ({ id, type, contexts });

  test("non-object type", () => {
    const input = declaration(0, "string");
    expect(typeDeclaration(input)).toBe("type T0 = string;");
  });

  test("object type", () => {
    const input = declaration(0, { a: "string" });
    expect(typeDeclaration(input)).toBe("type T0 = { a: string; };");
  });

  test("computed type", () => {
    const input = declaration(0, "string");
    expect(typeDeclaration(input, { computed: true })).toBe(
      "type T0 = C<string>;",
    );
  });

  test("with context", () => {
    const input = declaration(0, "string", ["foo", "bar"]);
    expect(typeDeclaration(input, { includeContexts: true })).toBe(
      "type T0 = string; // foo, bar",
    );
  });

  test("all together", () => {
    const input = declaration(0, { foo: "number", bar: "string" }, ["root"]);
    expect(
      typeDeclaration(input, {
        computed: true,
        includeContexts: true,
      }),
    ).toEqual("type T0 = C<{ foo: number; bar: string; }>; // root");
  });
});

describe("generateDts()", () => {
  test("compute helper", () => {
    const result = generateDts([], undefined, { computed: true });
    expect([...result][0]).toContain(
      "type C<A extends any> = {[K in keyof A]: A[K]} & {};",
    );
  });

  test("exported and non-exported types", () => {
    const result = generateDts(
      [
        { id: 0, type: "string", contexts: [] },
        { id: 1, type: "number", contexts: [] },
      ],
      "T0",
    );

    expect([...result]).toEqual([
      "type T0 = string;\n",
      "type T1 = number;\n",
      "\ndeclare const JSON: T0;\nexport default JSON;\n",
    ]);
  });
});
