// lib/s3-upload.ts
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION,
});

export async function uploadFileToS3(file: File, folder = "products") {
  const fileName = `haus-of-privae/v1/${folder}/${Date.now()}-${file.name}`;
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: file.type,
    // ACL: "public-read",
  };

  const upload = await s3.upload(params).promise();
  console.log("upload:  ", JSON.stringify(upload?.Location));
  return upload?.Location;
}
