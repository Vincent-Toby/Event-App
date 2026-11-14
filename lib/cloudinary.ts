import { v2 as cloudinary } from "cloudinary";

export async function uploadEventImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "event-app/events", resource_type: "image" },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Image upload failed"));
            return;
          }
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
}