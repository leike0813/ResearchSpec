import { createHash } from "node:crypto";

export function compactMarkerId(anchorId: string): string {
  return createHash("sha256").update(anchorId).digest("hex").slice(0, 12);
}

export function markerStart(anchorId: string): string {
  return `<!--rs:a:${compactMarkerId(anchorId)}-->`;
}

export function markerEnd(anchorId: string): string {
  return `<!--/rs:a:${compactMarkerId(anchorId)}-->`;
}
