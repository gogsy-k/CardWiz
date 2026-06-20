/*
 * Cloudinary unsigned upload (client-side). The cloud name + unsigned preset are
 * public by design; the REAL guardrails (image-only, size/format/folder limits)
 * live in the Cloudinary preset config, not here. If env is unset, upload is
 * disabled and the admin can still paste an image URL manually.
 */
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export const cloudinaryEnabled = !!(CLOUD && PRESET);

export async function uploadImage(file: File): Promise<string> {
  if (!cloudinaryEnabled) throw new Error("Cloudinary not configured");
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  if (!data.secure_url) throw new Error("No URL returned");
  return data.secure_url as string;
}
