import { z, type ZodTypeAny } from "zod";

/** Subset of JSON Schema used by TOOL_DEFINITIONS — converted for McpServer.tool(). */
type JsonProp = {
  type: string;
  description?: string;
  enum?: readonly string[];
  items?: { type?: string };
};

type JsonInputSchema = {
  type?: string;
  properties?: Readonly<Record<string, JsonProp>>;
  required?: readonly string[];
};

function propertyToZod(prop: JsonProp): ZodTypeAny {
  let field: ZodTypeAny;

  if (prop.type === "number") {
    field = z.number();
  } else if (prop.type === "string") {
    if (prop.enum && prop.enum.length > 0) {
      if (prop.enum.length === 1) {
        field = z.literal(prop.enum[0]);
      } else {
        field = z.enum(prop.enum as [string, ...string[]]);
      }
    } else {
      field = z.string();
    }
  } else if (prop.type === "array" && prop.items?.type === "string") {
    field = z.array(z.string());
  } else {
    field = z.unknown();
  }

  if (prop.description) {
    field = field.describe(prop.description);
  }
  return field;
}

/**
 * Builds a Zod raw shape compatible with @modelcontextprotocol/sdk McpServer.tool().
 */
export function inputSchemaToZodRawShape(schema: JsonInputSchema): Record<string, ZodTypeAny> {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(props)) {
    let field = propertyToZod(prop);
    if (!required.has(key)) {
      field = field.optional();
    }
    shape[key] = field;
  }

  return shape;
}
