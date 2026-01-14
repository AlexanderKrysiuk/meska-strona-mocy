import { z, ZodObject, ZodTypeAny } from "zod";

export function isFieldRequired<
  T extends ZodObject<any>
>(schema: T, fieldName: keyof T["shape"]) {
  const field = schema.shape[fieldName] as ZodTypeAny
  if (!field) return false
  return !field.isOptional() && !field.isNullable()
}
