export function firstFieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  if (!errors) return undefined;
  const key = Object.keys(errors).find(k => k.toLowerCase() === field.toLowerCase());
  return key ? errors[key]?.[0] : undefined;
}
