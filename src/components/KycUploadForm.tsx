"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KycUploadFormProps {
  currentDocUrl?: string | null;
  onUploadSuccess?: (path: string) => void;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export function KycUploadForm({ currentDocUrl, onUploadSuccess }: KycUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: `Invalid file type. Allowed: PDF, JPEG, PNG, WebP.` });
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: "error", text: `File too large. Maximum ${MAX_SIZE_MB}MB.` });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setMessage(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip data URL prefix
          const base64Data = result.split(",")[1] || result;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/provider/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileBase64: base64,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: "KYC document uploaded successfully!" });
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onUploadSuccess) onUploadSuccess(data.path);
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-400" />
        <h4 className="font-bold text-xs text-slate-100">KYC Document</h4>
        {currentDocUrl && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Uploaded
          </span>
        )}
      </div>

      {message && (
        <div
          className={`p-2.5 rounded-xl text-[11px] font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
          id="kyc-file-input"
        />

        {!selectedFile ? (
          <label
            htmlFor="kyc-file-input"
            className="flex flex-col items-center gap-2 py-4 cursor-pointer hover:bg-slate-900 rounded-lg transition-colors"
          >
            <Upload className="w-6 h-6 text-slate-500" />
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300">Click to upload KYC document</p>
              <p className="text-[10px] text-slate-500">PDF, JPEG, PNG, WebP — max 5MB</p>
            </div>
          </label>
        ) : (
          <div className="space-y-2">
            {preview && (
              <img src={preview} alt="KYC preview" className="w-full h-32 object-contain rounded-lg" />
            )}

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-500">
                  ({(selectedFile.size / 1024).toFixed(0)}KB)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1 rounded text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              size="sm"
              className="w-full text-xs font-bold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Document
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-500">
        Upload a government-issued ID (Aadhaar, PAN, Passport) or trade license for KYC verification.
      </p>
    </div>
  );
}
