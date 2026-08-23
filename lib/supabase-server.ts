import { createClient } from "@supabase/supabase-js";

// Buckets are set to public in Supabase dashboard
// RLS is disabled for public read access
// Uploads use anon key which has insert permission

export const supabaseServerClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKETS = [
  {
    name: "property-images",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024,
  },
  {
    name: "property-documents",
    public: true,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    fileSizeLimit: 5 * 1024 * 1024,
  },
  {
    name: "documents",
    public: true,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    fileSizeLimit: 5 * 1024 * 1024,
  },
  {
    name: "selfies",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png"],
    fileSizeLimit: 3 * 1024 * 1024,
  },
];

/**
 * Ensures bucket exists before server-side upload.
 */
export async function ensureServerBucketExists(bucketName: string) {
  const bucket = BUCKETS.find((b) => b.name === bucketName);
  const { error } = await supabaseServerClient.storage.createBucket(bucketName, {
    public: bucket?.public ?? true,
    allowedMimeTypes: bucket?.allowedMimeTypes,
    fileSizeLimit: bucket?.fileSizeLimit,
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error(`Failed to create bucket ${bucketName}:`, error);
  }
}

/**
 * Uploads a file to a specified Supabase storage bucket.
 * @param file The file to upload (Buffer or File object)
 * @param bucketName The name of the Supabase bucket (e.g., 'property-images')
 * @param fileName The desired path/name of the file in the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
  file: File | Blob,
  bucketName: string,
  fileName: string
): Promise<string> {
  await ensureServerBucketExists(bucketName);

  const { data, error } = await supabaseServerClient.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseServerClient.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
