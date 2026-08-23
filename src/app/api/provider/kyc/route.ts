import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1),
  fileBase64: z.string().min(100), // minimum reasonable base64 size
});

export async function POST(request: Request) {
  try {
    // Rate limit: 3 uploads per 5 minutes per IP
    const rl = enforceRateLimit(request, "kyc-upload", 3, 300_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait." },
        { status: 429, headers: rl.headers }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user is a provider
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "provider" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Only providers can upload KYC documents" }, { status: 403 });
    }

    const body = await request.json();
    const validation = uploadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { fileName, fileType, fileBase64 } = validation.data;

    // Server-side mime type check
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: PDF, JPEG, PNG, WebP. Got: ${fileType}`,
        },
        { status: 400 }
      );
    }

    // Server-side size check (base64 is ~33% larger than raw)
    const estimatedSize = Math.ceil((fileBase64.length * 3) / 4);
    if (estimatedSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 5MB. Your file is ~${Math.round(estimatedSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Decode base64 to buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${Date.now()}_${safeFileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("kyc-docs")
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error("KYC upload error:", uploadError.message);
      return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
    }

    // Update provider_profiles with the storage path
    await supabase
      .from("provider_profiles")
      .update({ kyc_doc_url: storagePath })
      .eq("id", user.id);

    return NextResponse.json({ success: true, path: storagePath });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** GET: Generate signed URL for viewing a KYC document (admin only) */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    // Admin check for viewing others' docs
    if (providerId && providerId !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const targetId = providerId || user.id;

    // Get the storage path from provider_profiles
    const { data: providerProfile } = await supabase
      .from("provider_profiles")
      .select("kyc_doc_url")
      .eq("id", targetId)
      .single();

    if (!providerProfile?.kyc_doc_url) {
      return NextResponse.json({ error: "No KYC document found" }, { status: 404 });
    }

    // Generate signed URL (expires in 10 minutes)
    const { data: signedUrl, error: signError } = await supabase.storage
      .from("kyc-docs")
      .createSignedUrl(providerProfile.kyc_doc_url, 600);

    if (signError) {
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: signedUrl.signedUrl });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
