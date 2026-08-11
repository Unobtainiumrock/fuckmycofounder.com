export interface SourceSizeResult {
  readonly accepted: boolean;
  readonly lineCount: number;
  readonly reason: string | undefined;
}

const reasonPattern = /source-size:\s*reason=(?<reason>[^\n]+)/u;

export function evaluateSourceSize(source: string): SourceSizeResult {
  const lineCount = source === "" ? 0 : source.split(/\r?\n/u).length;
  const reason = source
    .split(/\r?\n/u)
    .slice(0, 20)
    .join("\n")
    .match(reasonPattern)
    ?.groups?.reason?.trim();

  if (lineCount > 600) {
    return { accepted: false, lineCount, reason };
  }

  if (lineCount > 400 && !reason) {
    return { accepted: false, lineCount, reason: undefined };
  }

  return { accepted: true, lineCount, reason };
}
