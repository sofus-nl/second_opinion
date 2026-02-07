import type { ModelResult } from "./providers.js";

export function formatResults(results: ModelResult[]): string {
  return results
    .map((r) => {
      const header = `### ${r.model}`;
      const body = r.error ? `> Error: ${r.error}` : r.response ?? "";
      return `${header}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}
