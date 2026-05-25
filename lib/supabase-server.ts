import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for server-side usage (bypassing RLS if using service role, or using anon key)
// Note: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in .env
export const supabaseServerClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or use a service role key if you need to bypass RLS
);

/**
 * Uploads a file to a specified Supabase storage bucket.
 * @param file The file to upload (Buffer or File object)
 * @param bucketName The name of the Supabase bucket (e.g., 'properties')
 * @param fileName The desired path/name of the file in the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
  file: File | Blob,
  bucketName: string,
  fileName: string
): Promise<string> {
  const { data, error } = await supabaseServerClient.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseServerClient.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
