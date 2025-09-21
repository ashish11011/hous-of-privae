"use client";

import {
  LabelInput,
  LabelTextarea,
  MultiSelect,
  Select,
  UploadFile,
} from "@/components/index";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CATEGORY_1, CATEGORY_2, COLORS, MATERIALS, SIZES } from "@/const";
import {
  convertArrayToSelectOptions,
  convertColorToSelectOptions,
  convertSizeToSelectOptions,
} from "@/src/hepler";

import { Form, Formik, useFormikContext } from "formik";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const ProductEdit = ({ productData, slug }: any) => {
  const router = useRouter();

  const initialState = {
    name: productData?.name || "",
    description: productData?.description || "",
    basePrice: productData?.basePrice || 0,
    categoryId1: productData?.categoryId1 || "",
    categoryId2: productData?.categoryId2 || "",
    slug: productData?.slug || "",
    bannerImage: productData?.bannerImage || "",
    images: productData?.images || [],
    sizes: productData?.sizes || [],
    colors: productData?.colors || [],
    materials: productData?.materials || [],
  };

  const handleFormSubmit = async (values: any) => {
    console.log("values: ", values);
    try {
      if (slug === "create") {
        await fetch("/api/admin/products/create", {
          method: "POST",
          body: JSON.stringify(values),
        });
        alert("Product created successfully");
      } else {
        await fetch("/api/admin/products/update", {
          method: "POST",
          body: JSON.stringify(values),
        });
        alert("Product updated successfully");
      }

      router.push("/admin");
    } catch (error) {
      console.log(error);
      alert("Product creation failed");
    }
  };

  return (
    <div className=" p-4  flex  flex-wrap gap-8">
      <Formik
        // validationSchema={adminProductFormikSchema}
        initialValues={initialState}
        onSubmit={handleFormSubmit}
      >
        <Form className=" space-x-6 space-y-8">
          <LabelInput
            labelName="Name"
            placeholder="Enter your name"
            name="name"
            type="text"
          />
          <LabelTextarea
            labelName="Description"
            placeholder="Enter product description"
            name="description"
          />
          <LabelInput
            labelName="Base Price"
            placeholder="Enter base price"
            name="basePrice"
            type="number"
          />
          <Select
            labelName="Category Level 1"
            placeholder="Category Level 1"
            name="categoryId1"
            options={convertArrayToSelectOptions(CATEGORY_1)}
          />
          <Select
            labelName="Category Level 2"
            placeholder="Category Level 2"
            name="categoryId2"
            options={convertArrayToSelectOptions(CATEGORY_2)}
          />
          <div className=" space-y-2 w-md">
            <MultiSelect
              labelName="Select Colors"
              name="colors"
              placeholder="Choose colors"
              options={convertColorToSelectOptions(COLORS)}
            />
            <SelectedColors />
          </div>
          <div className=" space-y-2 w-full max-w-60">
            <MultiSelect
              labelName="Select sizes"
              name="sizes"
              placeholder="Choose sizes"
              options={convertSizeToSelectOptions(SIZES)}
            />
            <SelectedSizes />
          </div>
          <BannerImage />
          <ProductImages />
          <div className=" space-y-2">
            <MultiSelect
              labelName="Select materials"
              name="materials"
              placeholder="Choose materials"
              options={convertSizeToSelectOptions(MATERIALS)}
            />
            <SelectedMaterials />
          </div>
          <Button
            onClick={() => {
              console.log("clicked");
            }}
            type="submit"
          >
            Submit
          </Button>
        </Form>
      </Formik>
    </div>
  );
};

export default ProductEdit;

const SelectedColors = () => {
  const { values } = useFormikContext<{ colors: string[] }>();

  return (
    <div className="flex flex-wrap gap-2">
      {values.colors.length === 0 ? (
        <span>No colors selected</span>
      ) : (
        values.colors.map((color) => (
          <span
            key={color}
            className="px-2 py-1 rounded-md"
            style={{
              backgroundColor: color,
            }}
          >
            {color}
          </span>
        ))
      )}
    </div>
  );
};
const SelectedSizes = () => {
  const { values } = useFormikContext<{ sizes: string[] }>();

  return (
    <div className="flex gap-2">
      {values.sizes.length === 0 ? (
        <span>No sizes selected</span>
      ) : (
        values.sizes.map((size) => (
          <span key={size} className="px-2 py-1 border rounded-md">
            {size}
          </span>
        ))
      )}
    </div>
  );
};
const SelectedMaterials = () => {
  const { values } = useFormikContext<{ materials: string[] }>();

  return (
    <div className="flex gap-2">
      {values.materials.length === 0 ? (
        <span>No sizes selected</span>
      ) : (
        values.materials.map((material) => (
          <span key={material} className="px-2 py-1 border rounded-md">
            {material}
          </span>
        ))
      )}
    </div>
  );
};

const BannerImage = () => {
  const { values, setFieldValue } = useFormikContext<{ bannerImage: string }>();
  return (
    <div>
      <Label>Banner Image</Label>

      {values.bannerImage ? (
        <div className=" w-fit h-fit relative">
          <Image
            src={values.bannerImage}
            width={200}
            height={200}
            alt="banner"
          />
          <X
            onClick={() => setFieldValue("bannerImage", "")}
            className=" absolute cursor-pointer -top-2 -right-2 border rounded-full bg-white"
          />
        </div>
      ) : (
        <UploadFile
          onChange={(value: string) => setFieldValue("bannerImage", value)}
        />
      )}
    </div>
  );
};

const ProductImages = () => {
  const { values, setFieldValue } = useFormikContext<{ images: string[] }>();
  return (
    <div>
      <Label>Product Images</Label>
      <div className=" flex gap-4 items-start h-full flex-wrap w-full">
        {values.images?.map((image: string) => {
          return (
            <div key={image} className=" relative">
              <Image
                src={image}
                width={200}
                height={200}
                className=" w-32 h-auto object-contain"
                alt="banner"
              />
              <X
                onClick={() =>
                  setFieldValue(
                    "images",
                    values.images.filter((item) => item !== image)
                  )
                }
                className=" absolute cursor-pointer -top-2 -right-2 border rounded-full bg-white"
              />
            </div>
          );
        })}
      </div>
      <UploadFile
        onChange={(value: string) =>
          setFieldValue("images", [...values.images, value])
        }
      />
    </div>
  );
};
