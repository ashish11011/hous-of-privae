export const convertS3ToImageKit = (s3Url: string): string => {
  return s3Url.replace(
    "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/",
    "/"
  );
};

// https://ik.imagekit.io/hop/haus-of-privae/v1/products/1759177231796-Copy%20of%202S0A7918.jpg
// https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/products/1759177231796-Copy%20of%202S0A7918.jpg
