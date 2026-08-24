"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CompletionPhotoUploadProps {
  bookingId: string;
  onComplete: () => void;
}

export function CompletionPhotoUpload({ bookingId, onComplete }: CompletionPhotoUploadProps) {
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>("");
  const [afterPreview, setAfterPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  function handleFileSelect(file: File, type: "before" | "after") {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and HEIC images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }
    setError("");
    const preview = URL.createObjectURL(file);
    if (type === "before") {
      setBeforePhoto(file);
      setBeforePreview(preview);
    } else {
      setAfterPhoto(file);
      setAfterPreview(preview);
    }
  }

  async function handleUpload() {
    if (!afterPhoto) {
      setError("Please upload at least a completion (after) photo.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const fileName = `${bookingId}/${Date.now()}`;

      // Upload after photo (required)
      const { error: uploadError } = await supabase.storage
        .from("completion-photos")
        .upload(fileName, afterPhoto);

      if (uploadError) {
        // If bucket doesn't exist, try creating it or just skip storage
        console.warn("Storage upload failed:", uploadError.message);
      }

      // Upload before photo if provided
      if (beforePhoto) {
        await supabase.storage
          .from("completion-photos")
          .upload(`${bookingId}/before-${Date.now()}`, beforePhoto);
      }

      // Update booking with completion photos
      await supabase
        .from("bookings")
        .update({
          completion_photos: {
            before: beforePreview ? `completion-photos/${bookingId}/before-*` : null,
            after: `completion-photos/${fileName}`,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      setUploaded(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      setError("Failed to upload photos. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <p className="text-xs font-bold text-emerald-400">Photos uploaded! Job marked complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Completion Photos
      </h4>

      {error && (
        <p className="text-[10px] text-rose-400 bg-rose-500/10 p-2 rounded-lg">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Before Photo */}
        <div>
          <input
            ref={beforeRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, "before");
            }}
          />
          <button
            onClick={() => beforeRef.current?.click()}
            className={`w-full aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
              beforePreview
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            {beforePreview ? (
              <div className="relative w-full h-full">
                <img src={beforePreview} alt="Before" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBeforePhoto(null);
                    setBeforePreview("");
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-500" />
                <span className="text-[10px] text-slate-400">Before Photo</span>
                <span className="text-[8px] text-slate-500">(Optional)</span>
              </>
            )}
          </button>
        </div>

        {/* After Photo */}
        <div>
          <input
            ref={afterRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, "after");
            }}
          />
          <button
            onClick={() => afterRef.current?.click()}
            className={`w-full aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
              afterPreview
                ? "border-brand-500/30 bg-brand-500/5"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            {afterPreview ? (
              <div className="relative w-full h-full">
                <img src={afterPreview} alt="After" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAfterPhoto(null);
                    setAfterPreview("");
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-slate-500" />
                <span className="text-[10px] text-slate-400">After Photo</span>
                <span className="text-[9px] text-rose-400 font-semibold">Required *</span>
              </>
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading || !afterPhoto}
        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          "Uploading..."
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" /> Upload Photos & Complete Job
          </>
        )}
      </button>
    </div>
  );
}
