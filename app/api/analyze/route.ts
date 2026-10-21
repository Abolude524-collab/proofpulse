import { NextRequest, NextResponse } from "next/server";
import {
  AnalyzeRequestSchema,
  AnalyzeApiResponse,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_TEXT_LENGTH,
} from "@/lib/types";
import { extractClaimFromText, extractClaimFromImage, MultimodalNotSupportedError } from "@/lib/ai/extract-claim";
import { getSearchProvider } from "@/lib/retrieval";
import { assessEvidenceWithGemma } from "@/lib/ai/assess-evidence";
import { getDemoSample } from "@/lib/demo";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds max

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeApiResponse>> {
  const startTime = Date.now();

  try {
    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const parseResult = AnalyzeRequestSchema.safeParse(bodyJson);
    if (!parseResult.success) {
      const message = parseResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Request validation failed: ${message}`,
          code: "VALIDATION_FAILED",
        },
        { status: 400 }
      );
    }

    const { text, image, isDemoSample, sampleId } = parseResult.data;

    // Handle Demo Mode explicitly requested
    if (isDemoSample) {
      const sample = getDemoSample(sampleId);
      return NextResponse.json({
        success: true,
        report: sample.report,
      });
    }

    // Check for server credentials before running live requests
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY is not configured on the server. To test ProofPulse without an API key, use the Sample Claims below or configure GEMINI_API_KEY in your .env file.",
          code: "MISSING_API_KEY",
        },
        { status: 401 }
      );
    }

    // Step 1: Claim extraction
    let claim = "";

    if (image) {
      // Validate image server-side
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(image.mimeType)) {
        return NextResponse.json(
          {
            success: false,
            error: "Unsupported image type. Please upload a JPEG, PNG, or WebP screenshot.",
            code: "INVALID_IMAGE_TYPE",
          },
          { status: 400 }
        );
      }

      if (image.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`,
            code: "IMAGE_TOO_LARGE",
          },
          { status: 400 }
        );
      }

      try {
        claim = await extractClaimFromImage(image.base64, image.mimeType);
      } catch (err) {
        if (err instanceof MultimodalNotSupportedError) {
          return NextResponse.json(
            {
              success: false,
              error: err.message,
              code: "UNSUPPORTED_MODALITY",
            },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: "Could not read text from screenshot. Please try pasting the claim as text.",
            code: "OCR_FAILED",
          },
          { status: 422 }
        );
      }
    } else if (text && text.trim().length > 0) {
      const trimmedText = text.trim();
      if (trimmedText.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          {
            success: false,
            error: `Text input exceeds maximum limit of ${MAX_TEXT_LENGTH} characters.`,
            code: "TEXT_TOO_LONG",
          },
          { status: 400 }
        );
      }

      try {
        claim = await extractClaimFromText(trimmedText);
      } catch (err) {
        console.error("Claim extraction error:", err);
        claim = trimmedText.slice(0, 300);
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a claim or upload a screenshot to inspect.",
          code: "EMPTY_INPUT",
        },
        { status: 400 }
      );
    }

    if (!claim || claim.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No checkable factual claim could be identified in the input. Please enter the specific factual statement to check.",
          code: "NO_CLAIM_FOUND",
        },
        { status: 422 }
      );
    }

    // Step 2: Evidence retrieval
    const searchProvider = getSearchProvider();
    let retrievedSources = [];
    try {
      retrievedSources = await searchProvider.search(claim);
    } catch (retrievalError) {
      const msg =
        retrievalError instanceof Error
          ? retrievalError.message
          : "Web search retrieval failed.";
      return NextResponse.json(
        {
          success: false,
          error: `Evidence retrieval failed: ${msg}`,
          code: "RETRIEVAL_FAILED",
        },
        { status: 502 }
      );
    }

    // Step 3: Evidence assessment with Gemma
    let report;
    try {
      report = await assessEvidenceWithGemma(claim, retrievedSources);
    } catch (evalError) {
      const msg =
        evalError instanceof Error
          ? evalError.message
          : "Failed to evaluate retrieved evidence with Gemma.";
      return NextResponse.json(
        {
          success: false,
          error: `Evidence assessment failed: ${msg}`,
          code: "ASSESSMENT_FAILED",
        },
        { status: 500 }
      );
    }

    // Log operational metadata only (stage, duration, status; never user secrets or claim text)
    const durationMs = Date.now() - startTime;
    console.info(`[analyze] stage=complete durationMs=${durationMs} sources=${retrievedSources.length} mode=live`);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (unexpectedError) {
    console.error("[analyze] unexpected error occurred:", unexpectedError);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while analyzing the claim. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
