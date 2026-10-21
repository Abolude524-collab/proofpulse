import { z } from "zod";

// Configurable constants
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_TEXT_LENGTH = 1000;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const AssessmentEnum = z.enum([
  "Supported",
  "Contradicted",
  "Mixed evidence",
  "Insufficient evidence",
]);
export type Assessment = z.infer<typeof AssessmentEnum>;

export const EvidenceRelationshipEnum = z.enum([
  "supports",
  "contradicts",
  "context",
]);
export type EvidenceRelationship = z.infer<typeof EvidenceRelationshipEnum>;

export const EvidenceItemSchema = z.object({
  title: z.string().max(300).optional(),
  publisher: z.string().max(150).optional(),
  url: z.string().url().refine(
    (val) => {
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" }
  ),
  date: z.string().nullable().optional(),
  relevance: z.string().max(600),
  relationship: EvidenceRelationshipEnum,
  sourceExcerpt: z.string().max(1000).optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const EvidenceReportSchema = z.object({
  claim: z.string().min(1).max(500),
  assessment: AssessmentEnum,
  summary: z.string().min(1).max(1500),
  supportingEvidence: z.array(EvidenceItemSchema).max(10),
  contradictingOrContextEvidence: z.array(EvidenceItemSchema).max(10),
  unknowns: z.array(z.string().max(400)).max(10),
  limitations: z.array(z.string().max(400)).max(10),
  mode: z.enum(["live", "sample"]),
  analyzedAt: z.string().optional(),
});
export type EvidenceReport = z.infer<typeof EvidenceReportSchema>;

export const AnalyzeRequestSchema = z.object({
  text: z.string().max(MAX_TEXT_LENGTH).optional(),
  image: z
    .object({
      base64: z.string(),
      mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
      sizeBytes: z.number().max(MAX_IMAGE_SIZE_BYTES),
      name: z.string().optional(),
    })
    .optional(),
  isDemoSample: z.boolean().optional(),
  sampleId: z.string().optional(),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export type AnalyzeApiResponse =
  | {
      success: true;
      report: EvidenceReport;
    }
  | {
      success: false;
      error: string;
      code?: string;
      details?: string;
    };
