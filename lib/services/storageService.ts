import { supabase } from "../supabase";

/**
 * Uploads an image to Supabase Storage.
 * @param bucketName The name of the storage bucket ('avatars')
 * @param path The path where the file should be stored (e.g., `userId/avatar.jpg`)
 * @param base64Data The base64 representation of the image
 * @param contentType The MIME type (e.g., 'image/jpeg')
 * @returns The public URL of the uploaded image
 */
export async function uploadBase64Image(
  bucketName: string,
  path: string,
  base64Data: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  // Convert base64 to Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, blob, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return publicData.publicUrl;
}
