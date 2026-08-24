import { createClient } from "@supabase/supabase-js";

// Browser-only Supabase client using NEXT_PUBLIC_ keys
// Buckets exist in Supabase dashboard and are public with correct RLS policies
// - "property-images"  : property listing photos
// - "property-documents": ownership proof documents
// - "documents"        : host identity documents
// - "selfies"          : host live selfie photos

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to the specified Supabase Storage bucket using the browser
 * (anon key) client. Returns the full public HTTPS URL.
 *
 * @param bucketName - One of the four known bucket names
 * @param file       - The File object to upload
 * @param userId     - Used as a path prefix to namespace files per user
 * @returns          - Full public https:// URL for the uploaded file
 */
export async function uploadFile(
  bucketName: "property-images" | "property-documents" | "documents" | "selfies",
  file: File,
  userId: string
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error(`[Storage] Upload error for bucket "${bucketName}":`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(data.path);

  if (!publicUrl || !publicUrl.startsWith("https://")) {
    throw new Error("Failed to generate a valid public URL after upload.");
  }

  return publicUrl;
}

/**
 * Derives the public URL for an already-uploaded path without making a network
 * request (uses the SDK's synchronous getPublicUrl).
 */
export function getPublicUrl(
  bucketName: "property-images" | "property-documents" | "documents" | "selfies",
  path: string
): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(path);

  return publicUrl;
}
