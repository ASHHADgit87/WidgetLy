export function isHoneypotTripped(
  data: Record<string, unknown>,
  honeypotFieldName: string,
): boolean {
  const value = data[honeypotFieldName];
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value === true;
  return false;
}

export function stripHoneypotField(
  data: Record<string, unknown>,
  honeypotFieldName: string,
): Record<string, unknown> {
  const result = { ...data } as Record<string, unknown>;
  delete result[honeypotFieldName];
  return result;
}
