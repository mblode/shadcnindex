export function toRegistrySlug(namespace: string): string {
  return namespace.startsWith("@") ? namespace.slice(1) : namespace;
}
