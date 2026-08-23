"use client";

import { createClient } from "@supabase/supabase-js";

// Buckets are set to public in Supabase dashboard
// RLS is disabled for public read access
// Uploads use anon key which has insert permission

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function ensureBucketExists(
  bucketName: "property-images" | "property-documents" | "documents" | "selfies"
): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === bucketName);

    if (!exists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes:
          bucketName === "property-documents" || bucketName === "documents"
            ? ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
            : ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        fileSizeLimit: 10 * 1024 * 1024,
      });
    }
  } catch (err) {
    console.warn(`[Storage Utility] Bucket existence check warning for ${bucketName}:`, err);
  }
}

export async function uploadFile(
  bucketName: "property-images" | "property-documents" | "documents" | "selfies",
  file: File,
  userId: string
): Promise<string> {
  // Ensure bucket exists prior to upload
  await ensureBucketExists(bucketName);

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error(`Upload error for bucket ${bucketName}:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(data.path);

  return publicUrl;
}

export function getPublicUrl(
  bucketName: "property-images" | "property-documents" | "documents" | "selfies",
  path: string
): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(path);

  return publicUrl;
}
