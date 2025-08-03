import { COLORS } from "@/const";

export const getColorNameByHex = (hex: string) => {
  return COLORS.find((item) => item.hex === hex)?.label;
};
