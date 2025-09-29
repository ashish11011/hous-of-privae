"use client";

import { CATEGORY_1, CATEGORY_2 } from "@/const";

export const useConvertArrayToSelectOptions = (array: any[]) => {
  return array.map((item) => {
    return { value: item.slug, label: item.name };
  });
};
export const useConvertColorToSelectOptions = (array: any[]) => {
  return array.map((item) => {
    return { value: item.hex, label: item.label };
  });
};
export const useConvertSizeToSelectOptions = (array: any[]) => {
  return array.map((item) => {
    return { value: item, label: item };
  });
};

export const useGetCategoryFromSlug = (id: string) => {
  return (
    CATEGORY_1.find((item) => item.slug === id) ||
    CATEGORY_2.find((item) => item.slug === id)
  );
};
