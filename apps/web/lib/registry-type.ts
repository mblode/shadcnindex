const REGISTRY_TYPE_PREFIX = "registry:" as const;

export function toRegistryTypeLabel(
  type: string | null | undefined
): string | null {
  if (!type) {
    return null;
  }

  return type.startsWith(REGISTRY_TYPE_PREFIX)
    ? type.slice(REGISTRY_TYPE_PREFIX.length)
    : type;
}
