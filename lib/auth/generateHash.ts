import crypto from "crypto";
export const generateSecretHash = (username: string) => {
  const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
  hmac.update(username + CLIENT_ID);
  return hmac.digest("base64");
};

export const CLIENT_ID = "6gv30nr1ikm4kcvbpjkbjfu4mt";
export const CLIENT_SECRET =
  "1rac0cfsvb0e2junvp6t0lt7cjsg25okah3nd4sbid5ff7huql9f";
export const USER_POOL_ID = "ap-south-1_zz1s6rv3S";
