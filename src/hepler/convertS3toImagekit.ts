const s3Origin = "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/";
const imageKitOrigin = "https://ik.imagekit.io/hop";

export const convertS3ToImageKit = (imageUrl?: string | null): string => {
  if (!imageUrl) return "/refined/shyama-purple-sharara.jpg";

  if (imageUrl.startsWith(s3Origin)) {
    return `/${imageUrl.slice(s3Origin.length)}`;
  }

  if (imageUrl.startsWith(`${imageKitOrigin}/`)) {
    return imageUrl.slice(imageKitOrigin.length);
  }

  return imageUrl;
};

// https://ik.imagekit.io/hop/haus-of-privae/v1/products/1759177231796-Copy%20of%202S0A7918.jpg
// https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/products/1759177231796-Copy%20of%202S0A7918.jpg
