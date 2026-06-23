import { NextResponse } from "next/server";
import AWS from "aws-sdk";

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();

    const s3 = new AWS.S3({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_S3_SECRET_KEY,
      region: process.env.NEXT_PUBLIC_S3_REGION,
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileName,
      ContentType: fileType,
      Expires: 60, // The URL will expire in 60 seconds
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    
    // Calculate the final file URL (without the auth query parameters)
    const fileUrl = uploadUrl.split("?")[0];

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json({ error: "Failed to generate pre-signed URL" }, { status: 500 });
  }
}
