import { createHash } from "node:crypto";

import { AnnotationRawSourceSchema, type AnnotationRawSource } from "../core/contracts/annotation.js";
import { type PlannedAnnotationWorkingWrite } from "./contracts.js";
import { annotationIntakePaths } from "./paths.js";

export interface CapturedAnnotationSource {
  source: AnnotationRawSource;
  content: string;
  write: PlannedAnnotationWorkingWrite;
}

export function captureAnnotationSource(input: {
  annotationSetId: string;
  content: string;
  format: AnnotationRawSource["format"];
  mediaType?: string;
  extension?: string;
}): CapturedAnnotationSource {
  const contentSha256 = sha256(input.content);
  const extension = normalizeExtension(input.extension ?? defaultExtension(input.format));
  const sourceId = `source-${contentSha256.slice(0, 20)}`;
  const path = `${annotationIntakePaths(input.annotationSetId).raw_sources}/${contentSha256}${extension}`;
  const source = AnnotationRawSourceSchema.parse({
    source_id: sourceId,
    path,
    sha256: contentSha256,
    format: input.format,
    media_type: input.mediaType ?? defaultMediaType(input.format),
  });
  return {
    source,
    content: input.content,
    write: {
      action: "create_only",
      path,
      content: input.content,
      sha256: contentSha256,
    },
  };
}

export function captureConversationFeedback(input: {
  annotationSetId: string;
  messages: Array<{ message_id: string; author: string; body: string }>;
}): CapturedAnnotationSource {
  const content = `${JSON.stringify({
    schema_version: "1",
    messages: input.messages,
  }, null, 2)}\n`;
  return captureAnnotationSource({
    annotationSetId: input.annotationSetId,
    content,
    format: "conversation_json",
    mediaType: "application/json",
    extension: ".json",
  });
}

function normalizeExtension(value: string): string {
  const extension = value.startsWith(".") ? value : `.${value}`;
  if (!/^\.[A-Za-z0-9]+$/.test(extension)) throw new Error("Annotation source extension is invalid.");
  return extension.toLowerCase();
}

function defaultExtension(format: AnnotationRawSource["format"]): string {
  return format.endsWith("_json") ? ".json" : format.startsWith("markdown_") ? ".md" : ".txt";
}

function defaultMediaType(format: AnnotationRawSource["format"]): string {
  return format.endsWith("_json") ? "application/json" : format.startsWith("markdown_") ? "text/markdown" : "text/plain";
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

