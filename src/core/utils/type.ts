export function is<T extends Record<string, unknown>>(v: any, k: string): v is T {
  return k in v
}
