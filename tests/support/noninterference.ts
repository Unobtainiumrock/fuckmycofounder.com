interface NoninterferencePolicy {
  forbiddenKeys: readonly string[];
  forbiddenValues: readonly string[];
}

interface ProjectionLeak {
  kind: "forbidden-key" | "forbidden-value";
  path: string;
  value: string;
}

interface InspectionContext {
  policy: NoninterferencePolicy;
  leaks: ProjectionLeak[];
  visited: WeakSet<object>;
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
    inspectProperty(
      value,
      key,
      descriptors[key as keyof typeof descriptors],
      path,
      { policy, leaks, visited },
    );
  }
}

function inspectProperty(
  owner: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
  path: string,
  context: InspectionContext,
): void {
  const { policy, leaks, visited } = context;
  const keyLabel = typeof key === "symbol" ? key.toString() : String(key);
  const entryPath = `${path}.${keyLabel}`;
  if (policy.forbiddenKeys.includes(keyLabel)) {
    leaks.push({ kind: "forbidden-key", path: entryPath, value: keyLabel });
  }
  if (!descriptor) return;

  if ("value" in descriptor) {
    inspect(descriptor.value as unknown, entryPath, policy, leaks, visited);
    return;
  }

  // JSON.stringify invokes enumerable getters, so public-projection proof must
  // inspect the same value that would cross that serialization boundary.
  if (descriptor.enumerable && descriptor.get) {
    try {
      inspect(Reflect.get(owner, key), entryPath, policy, leaks, visited);
    } catch {
      // A throwing getter aborts serialization instead of exposing a value.
    }
  }
}
