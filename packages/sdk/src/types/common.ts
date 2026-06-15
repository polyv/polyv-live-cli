/**
 * Common Types
 *
 * General-purpose utility types.
 */

/**
 * Makes specified keys of T required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Makes specified keys of T optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Extract the element type of an array
 */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/**
 * Make all properties mutable
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * JSON value types
 */
export type JsonValue = Primitive | JsonObject | JsonArray;

/**
 * JSON object
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * JSON array
 */
export type JsonArray = JsonValue[];
