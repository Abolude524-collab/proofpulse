import assert from "node:assert";
import {
  EvidenceReportSchema,
  EvidenceItemSchema,
  AnalyzeRequestSchema,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
} from "../lib/types.ts";
import { isValidHttpUrl, extractHostname, normalizeUrl } from "../lib/retrieval/url-sanitizer.ts";
import { DEMO_SAMPLES } from "../lib/demo.ts";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    failed++;
  }
}

async function runAll() {
  console.log("\n--- ProofPulse Test Suite ---\n");

  // 1. URL Sanitizer tests
  test("URL validation allows valid http and https", () => {
    assert.strictEqual(isValidHttpUrl("https://nasa.gov/article"), true);
    assert.strictEqual(isValidHttpUrl("http://example.org/test"), true);
    assert.strictEqual(isValidHttpUrl("ftp://files.example.com"), false);
    assert.strictEqual(isValidHttpUrl("javascript:alert(1)"), false);
    assert.strictEqual(isValidHttpUrl("not-a-url"), false);
    assert.strictEqual(isValidHttpUrl(""), false);
  });

  test("Hostname extraction correctly removes www and parses domains", () => {
    assert.strictEqual(extractHostname("https://www.nature.com/articles/xyz"), "nature.com");
    assert.strictEqual(extractHostname("https://sub.domain.co.uk/path"), "sub.domain.co.uk");
    assert.strictEqual(extractHostname("invalid"), "");
  });

  test("URL normalization strips trailing slashes and hashes", () => {
    assert.strictEqual(normalizeUrl("https://example.com/page/#section"), "https://example.com/page");
    assert.strictEqual(normalizeUrl("https://example.com/path/"), "https://example.com/path");
  });

  // 2. Schema Validation tests
  test("EvidenceItemSchema rejects invalid protocols and malformed URLs", () => {
    const valid = {
      title: "Test Article",
      publisher: "example.com",
      url: "https://example.com/news",
      date: "2024-01-01",
      relevance: "Directly discusses the subject claim.",
      relationship: "supports",
    };
    assert.doesNotThrow(() => EvidenceItemSchema.parse(valid));

    const badProtocol = { ...valid, url: "file:///etc/passwd" };
    assert.throws(() => EvidenceItemSchema.parse(badProtocol));

    const badRelationship = { ...valid, relationship: "unverified" };
    assert.throws(() => EvidenceItemSchema.parse(badRelationship));
  });

  test("EvidenceReportSchema validates all allowed assessment types", () => {
    const allowed = ["Supported", "Contradicted", "Mixed evidence", "Insufficient evidence"];
    for (const assessment of allowed) {
      const report = {
        claim: "Test claim under review",
        assessment,
        summary: "Summary of evidence",
        supportingEvidence: [],
        contradictingOrContextEvidence: [],
        unknowns: ["Unresolved question"],
        limitations: ["Search bounded"],
        mode: "live",
      };
      assert.doesNotThrow(() => EvidenceReportSchema.parse(report));
    }

    const invalid = {
      claim: "Test claim",
      assessment: "True", // Not an allowed enum
      summary: "Summary",
      supportingEvidence: [],
      contradictingOrContextEvidence: [],
      unknowns: [],
      limitations: [],
      mode: "live",
    };
    assert.throws(() => EvidenceReportSchema.parse(invalid));
  });

  // 3. Demo samples validation
  test("All DEMO_SAMPLES strictly satisfy EvidenceReportSchema", () => {
    assert.ok(DEMO_SAMPLES.exoplanet);
    assert.ok(DEMO_SAMPLES.radiation);
    assert.ok(DEMO_SAMPLES.wifi);

    // Verify exoplanet fixture (Mixed evidence)
    const exoplanetParsed = EvidenceReportSchema.parse(DEMO_SAMPLES.exoplanet.report);
    assert.strictEqual(exoplanetParsed.assessment, "Mixed evidence");
    assert.strictEqual(exoplanetParsed.mode, "sample");

    // Verify radiation fixture (Supported)
    const radParsed = EvidenceReportSchema.parse(DEMO_SAMPLES.radiation.report);
    assert.strictEqual(radParsed.assessment, "Supported");

    // Verify wifi fixture (Insufficient evidence)
    const wifiParsed = EvidenceReportSchema.parse(DEMO_SAMPLES.wifi.report);
    assert.strictEqual(wifiParsed.assessment, "Insufficient evidence");
  });

  // 4. Request validation bounds
  test("AnalyzeRequestSchema validates image size and mime types", () => {
    const validImageReq = {
      image: {
        base64: "aGVsbG8=",
        mimeType: "image/png",
        sizeBytes: 1024 * 500, // 500KB
        name: "test.png",
      },
    };
    assert.doesNotThrow(() => AnalyzeRequestSchema.parse(validImageReq));

    // Oversized image > 8MB
    const oversizedImageReq = {
      image: {
        base64: "aGVsbG8=",
        mimeType: "image/png",
        sizeBytes: MAX_IMAGE_SIZE_BYTES + 1024,
      },
    };
    assert.throws(() => AnalyzeRequestSchema.parse(oversizedImageReq));

    // Unsupported mime type
    const badMimeReq = {
      image: {
        base64: "aGVsbG8=",
        mimeType: "image/gif",
        sizeBytes: 1024,
      },
    };
    assert.throws(() => AnalyzeRequestSchema.parse(badMimeReq));
  });

  test("AnalyzeRequestSchema enforces maximum text length bound", () => {
    const validText = { text: "Short claim" };
    assert.doesNotThrow(() => AnalyzeRequestSchema.parse(validText));

    const overlyLongText = { text: "a".repeat(MAX_TEXT_LENGTH + 1) };
    assert.throws(() => AnalyzeRequestSchema.parse(overlyLongText));
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
