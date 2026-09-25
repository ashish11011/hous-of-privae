import * as Yup from "yup";
import { SIZES } from "@/const/globalConstants";
export const adminProductFormikSchema = Yup.object({
  name: Yup.string().required("Required"),
  pricingConfig: Yup.array().of(Yup.object({
    size: Yup.string().oneOf([...SIZES]).required(),
    basePrice: Yup.number().min(0).required(),
    strikethroughPrice: Yup.number().min(0).nullable(),
    isVisible: Yup.boolean().required(),
  })).required(),
  variants: Yup.array().of(Yup.object({
    color: Yup.string().required(), bannerImage: Yup.string().required(),
    images: Yup.array().of(Yup.string().required()).required(),
  })).min(1).required(),
});
