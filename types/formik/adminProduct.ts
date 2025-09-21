import * as Yup from "yup";
export const adminProductFormikSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  basePrice: Yup.number().required("Required"),
  category1: Yup.string().required("Required"),
  category2: Yup.string().required("Required"),
  slug: Yup.string(),
  bannerImage: Yup.string().required("Required"),
  images: Yup.array().required("Required"),
  sizes: Yup.array().required("Required"),
  colors: Yup.array().required("Required"),
  materials: Yup.array().required("Required"),
});
