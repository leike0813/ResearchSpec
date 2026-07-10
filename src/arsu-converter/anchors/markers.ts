import { ANCHOR_ID_PATTERN } from "./types.js";

export function isAnchorId(value: string): boolean {
  return ANCHOR_ID_PATTERN.test(value);
}

export function markerStart(anchorId: string): string {
  return `<!--rs:${anchorId}-->`;
}

export function markerEnd(anchorId: string): string {
  return `<!--/rs:${anchorId}-->`;
}
