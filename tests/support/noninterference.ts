interface NoninterferencePolicy {
  forbiddenKeys: readonly string[];
  forbiddenValues: readonly string[];
}

interface ProjectionLeak {
  kind: "forbidden-key" | "forbidden-value";
  path: string;
  value: string;
}

export function findProjectionLeaks(
  value: unknown,
  policy: NoninterferencePolicy,
): ProjectionLeak[] {
  const leaks: ProjectionLeak[] = [];
  const visited = new WeakSet<object>();

  inspect(value, "$", policy, leaks, visited);
  return leaks;
}

function inspect(
  value: unknown,
  path: string,
  policy: NoninterferencePolicy,
  leaks: ProjectionLeak[],
  visited: WeakSet<object>,
): void {
  if (typeof value === "string") {
    for (const forbidden of policy.forbiddenValues) {
      if (forbidden && value.includes(forbidden)) {
        leaks.push({ kind: "forbidden-value", path, value: forbidden });
      }
    }
    return;
  }
  if (!value || typeof value !== "object" || visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      inspect(entry, `${path}[${index}]`, policy, leaks, visited),
    );
    return;
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (key === "stack") continue;
    const descriptor = descriptors[key as keyof typeof descriptors];
    const keyLabel = typeof key === "symbol" ? key.toString() : key;
    const entryPath = `${path}.${keyLabel}`;
    if (policy.forbiddenKeys.includes(keyLabel)) {
      leaks.push({ kind: "forbidden-key", path: entryPath, value: keyLabel });
    }
    if (!descriptor || !("value" in descriptor)) continue;
    const entry = descriptor.value as unknown;
    inspect(entry, entryPath, policy, leaks, visited);
  }
}
