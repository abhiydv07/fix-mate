"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Upload, X, Plus, ImageIcon } from "lucide-react";

interface PortfolioPhoto {
  id: string;
  url: string;
  caption: string;
  created_at: string;
}

export function ProviderPortfolio() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const supabase = createClient();

  useEffect(() => { loadPhotos(); }, []);

  async function loadPhotos() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("provider_photos")
      .select("*")
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setPhotos(data as PortfolioPhoto[]);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `portfolio/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("kyc-docs")
      .upload(path, file, { contentType: file.type });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("kyc-docs").getPublicUrl(path);

      await supabase.from("provider_photos").insert({
        provider_id: user.id,
        url: urlData.publicUrl,
        caption: caption || "Work photo",
      });

      setCaption("");
      loadPhotos();
    }
    setUploading(false);
  }

  async function deletePhoto(id: string) {
    await supabase.from("provider_photos").delete().eq("id", id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Work Portfolio</h3>
        <span className="text-[10px] text-slate-400">({photos.length} photos)</span>
      </div>

      {/* Upload */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Photo caption..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500"
        />
        <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold cursor-pointer transition-colors">
          {uploading ? "Uploading..." : <><Upload className="w-3.5 h-3.5" /> Upload</>}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Gallery */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative group">
              <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] text-white font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity">{photo.caption}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Camera className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No photos yet. Upload your work to build trust.</p>
        </div>
      )}
    </div>
  );
}
