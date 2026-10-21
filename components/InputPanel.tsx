"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/types";
import { DEMO_SAMPLES } from "@/lib/demo";

interface InputPanelProps {
  onAnalyze: (payload: {
    text?: string;
    image?: {
      base64: string;
      mimeType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
      sizeBytes: number;
      name?: string;
    };
    isDemoSample?: boolean;
    sampleId?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function InputPanel({
  onAnalyze,
  isLoading,
  error,
  onClearError,
}: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
  } | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (tab: "text" | "screenshot") => {
    setActiveTab(tab);
    setClientError(null);
    onClearError();
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    if (clientError) setClientError(null);
    if (error) onClearError();
  };

  const handleFileSelect = (file: File) => {
    setClientError(null);
    onClearError();

    // Validate MIME type
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as any)) {
      setClientError(
        "Unsupported file type. Please upload a JPEG, PNG, or WebP image."
      );
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setClientError(
        `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 8MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract pure base64 without data:image/...;base64,
      const base64Clean = result.split(",")[1];
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile({
        file,
        previewUrl,
        base64: base64Clean,
      });
    };
    reader.onerror = () => {
      setClientError("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setClientError(null);
    onClearError();

    if (activeTab === "text") {
      const trimmed = textInput.trim();
      if (!trimmed) {
        setClientError("Please enter a claim or message before analyzing.");
        return;
      }
      if (trimmed.length > MAX_TEXT_LENGTH) {
        setClientError(
          `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.`
        );
        return;
      }
      await onAnalyze({ text: trimmed });
    } else {
      if (!selectedFile) {
        setClientError("Please choose or drop a screenshot first.");
        return;
      }
      await onAnalyze({
        image: {
          base64: selectedFile.base64,
          mimeType: selectedFile.file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
          sizeBytes: selectedFile.file.size,
          name: selectedFile.file.name,
        },
      });
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = DEMO_SAMPLES[sampleId];
    if (sample) {
      setTextInput(sample.claim);
      setActiveTab("text");
      setClientError(null);
      onClearError();
      onAnalyze({ isDemoSample: true, sampleId });
    }
  };

  const activeError = clientError || error;

  return (
    <div className="w-full bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      {/* Segmented Tab Control */}
      <div
        role="tablist"
        aria-label="Input mode selection"
        className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/70"
      >
        <button
          role="tab"
          id="tab-text"
          aria-selected={activeTab === "text"}
          aria-controls="panel-text"
          onClick={() => handleTabChange("text")}
          className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === "text"
              ? "bg-surface text-ink shadow-xs"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste text</span>
        </button>

        <button
          role="tab"
          id="tab-screenshot"
          aria-selected={activeTab === "screenshot"}
          aria-controls="panel-screenshot"
          onClick={() => handleTabChange("screenshot")}
          className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === "screenshot"
              ? "bg-surface text-ink shadow-xs"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Upload screenshot</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "text" ? (
        <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" className="space-y-2">
          <label htmlFor="claim-textarea" className="block text-xs font-semibold text-ink">
            Claim or message to investigate
          </label>
          <div className="relative">
            <textarea
              id="claim-textarea"
              value={textInput}
              onChange={handleTextChange}
              disabled={isLoading}
              rows={4}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Paste the exact message, tweet, headline, or claim you want to check..."
              className="w-full p-3.5 text-sm bg-slate-50/50 border border-border rounded-xl text-ink placeholder:text-slate-400 focus:bg-surface focus:border-accent transition resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-ink-muted px-1 mt-1">
              <span>Supports claims, headlines, quotes, or conversational messages.</span>
              <span>
                {textInput.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>

          {/* Sample quick picks */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Or try a benchmark sample:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample("exoplanet")}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200/80 text-ink rounded-lg border border-slate-200 transition text-left"
              >
                🔭 Exoplanet Water Vapor (Mixed)
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample("radiation")}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200/80 text-ink rounded-lg border border-slate-200 transition text-left"
              >
                🍌 Banana Radioactivity (Supported)
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample("wifi")}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200/80 text-ink rounded-lg border border-slate-200 transition text-left"
              >
                📡 WiFi School Ban (Insufficient)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div id="panel-screenshot" role="tabpanel" aria-labelledby="tab-screenshot" className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            id="screenshot-input"
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? "border-accent bg-indigo-50/50"
                  : "border-border hover:border-slate-400 bg-slate-50/50"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 text-accent flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-ink">
                Drag and drop a screenshot here, or{" "}
                <span className="text-accent underline">browse</span>
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Supports PNG, JPEG, or WebP up to 8 MB.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-border">
                    <img
                      src={selectedFile.previewUrl}
                      alt="Screenshot thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-ink truncate max-w-[200px] sm:max-w-[320px]">
                      {selectedFile.file.name}
                    </p>
                    <p className="text-ink-muted">
                      {(selectedFile.file.size / 1024).toFixed(0)} KB •{" "}
                      {selectedFile.file.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-accent hover:underline px-2 py-1"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label="Remove image"
                    className="p-1 text-ink-muted hover:text-ink hover:bg-slate-200/60 rounded-md transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Model modality notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Model Modality Note:</span>
              <p className="text-blue-800">
                Gemma 4 (gemma-4-26b-a4b-it) on the Gemini API is a text-only language model. If you upload a screenshot, you can also paste the text directly into the Text tab for immediate analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Announcement */}
      {activeError && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Notice:</span>
            <p className="leading-relaxed">{activeError}</p>
          </div>
        </div>
      )}

      {/* Action CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || (activeTab === "text" && !textInput.trim()) || (activeTab === "screenshot" && !selectedFile)}
        className="w-full py-3 px-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm shadow-sm"
      >
        <span>Analyze evidence</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
