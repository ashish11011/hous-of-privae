// lib/s3-upload.ts
import imageCompression from "browser-image-compression";

export async function uploadFileToS3(file: File, folder = "products") {
  let fileToUpload = file;

  // 1. Compress the image if needed
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 0.4,
      useWebWorker: true,
    };
    try {
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  }

  const fileName = `haus-of-privae/v1/${folder}/${Date.now()}-${fileToUpload.name}`;
  const fileType = fileToUpload.type;

  // 2. Fetch the pre-signed URL from the API route
  const res = await fetch("/api/s3-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!res.ok) {
    throw new Error("Failed to get pre-signed URL");
  }

  const { uploadUrl, fileUrl } = await res.json();

  // 3. Upload the file directly to S3 using the pre-signed URL
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
    body: fileToUpload,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to S3");
  }

  // 4. Return the public file URL
  return fileUrl;
}
