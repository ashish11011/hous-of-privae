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
import {
  COLORS,
  MATERIALS,
  SIZES,
} from "@/const";
import { convertS3ToImageKit } from "@/src/hepler";
import {
  useConvertColorToSelectOptions,
  useConvertSizeToSelectOptions,
} from "@/src/hooks/convertHooks";

import { Form, Formik, useFormikContext } from "formik";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  level: number;
  isActive?: boolean;
};

function normalizeCategoryValue(value: string, categories: CategoryOption[], level: number) {
  const category = categories.find(
    (item) => item.level === level && (item.id === value || item.slug === value)
  );

  return category?.id ?? value ?? "";
}

function categorySelectOptions(categories: CategoryOption[], level: number) {
  return categories
    .filter((category) => category.level === level && category.isActive !== false)
    .map((category) => ({
      value: category.id,
      label: category.name,
    }));
}

const ProductEdit = ({ productData, slug, categories = [] }: any) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialState = {
    name: productData?.name || "",
    sku: productData?.sku || "",

    description: productData?.description || "",
    basePrice: productData?.basePrice || 0,
    categoryId1: normalizeCategoryValue(productData?.categoryId1 || "", categories, 1),
    categoryId2: normalizeCategoryValue(productData?.categoryId2 || "", categories, 2),
    slug: productData?.slug || "",
    model_height: productData?.model_height || "",

    care: productData?.care || "",
    style_note: productData?.style_note || "",
    customization: productData?.customization || "",

    bannerImage: productData?.bannerImage || "",
    images: productData?.images || [],
    sizes: productData?.sizes || [],
    colors: productData?.colors || [],
    materials: productData?.materials || [],
    isInStoke: productData?.isInStoke ?? true,
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (slug === "create") {
        const res = await fetch("/api/admin/products/create", {
          method: "POST",
          body: JSON.stringify(values),
        });
        const resMsg = await res.json();
        alert(resMsg.msg);
      } else {
        const res = await fetch("/api/admin/products/update", {
          method: "POST",
          body: JSON.stringify(values),
        });
        const resMsg = await res.json();

        alert(resMsg.msg);
      }

      router.push("/admin");
    } catch (error) {
      console.log(error);
      alert("Product creation failed");
    }
  };

  const handleItemDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/delete", {
        method: "POST",
        body: JSON.stringify({ slug: productData.slug }),
      });
      if (res.status === 200) alert("Product deleted successfully");
      router.push("/admin");
    } catch (error) {
      console.log(error);
      alert("Product creation failed");
    } finally {
      setLoading(false);
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
          <LabelInput
            labelName="SKU"
            placeholder="Enter product SKU"
            name="sku"
            type="text"
          />
          <LabelTextarea
            labelName="Description"
            placeholder="Enter product description"
            name="description"
          />
          {/* @@@@@@@@@@@@@@@@@@@@@@ */}
          <LabelTextarea
            labelName="care"
            placeholder="Enter product care"
            name="care"
          />
          <LabelTextarea
            labelName="style_note"
            placeholder="Enter product style_note"
            name="style_note"
          />
          <LabelTextarea
            labelName="customization"
            placeholder="Enter product customization"
            name="customization"
          />
          <LabelTextarea
            labelName="Model Height"
            placeholder="Enter model height"
            name="model_height"
          />
          <LabelInput
            labelName="Base Price"
            placeholder="Enter base price"
            name="basePrice"
            type="number"
          />
          <LabelInput
            labelName="Semi Stitched Price"
            placeholder="Enter base price"
            name="semiStitchedPrice"
            type="number"
          />
          <StockCheckbox />
          <Select
            labelName="Category Level 1"
            placeholder="Category Level 1"
            name="categoryId1"
            options={categorySelectOptions(categories, 1)}
          />
          <Select
            labelName="Category Level 2"
            placeholder="Category Level 2"
            name="categoryId2"
            options={categorySelectOptions(categories, 2)}
          />
          <div className=" space-y-2 w-md">
            <MultiSelect
              labelName="Select Colors"
              name="colors"
              placeholder="Choose colors"
              options={useConvertColorToSelectOptions(COLORS)}
            />
            <CustomColorPicker />
            <SelectedColors />
          </div>
          <div className=" space-y-2 w-full max-w-60">
            <MultiSelect
              labelName="Select sizes"
              name="sizes"
              placeholder="Choose sizes"
              options={useConvertSizeToSelectOptions(SIZES)}
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
              options={useConvertSizeToSelectOptions(MATERIALS)}
            />
            <SelectedMaterials />
          </div>
          <Button
            onClick={() => {
              handleItemDelete();
            }}
            type="button"
            variant={"destructive"}
            disabled={loading}
          >
            Delete
          </Button>
          <Button
            onClick={() => {
              console.log("clicked");
            }}
            type="submit"
            disabled={loading}
          >
            Submit
          </Button>
        </Form>
      </Formik>
    </div>
  );
};

export default ProductEdit;

const StockCheckbox = () => {
  const { values, setFieldValue } = useFormikContext<{ isInStoke: boolean }>();

  return (
    <label className="flex w-fit items-center gap-3 rounded-md border px-4 py-3">
      <input
        type="checkbox"
        checked={values.isInStoke}
        onChange={(event) => setFieldValue("isInStoke", event.target.checked)}
        className="h-4 w-4"
      />
      <span className="text-sm font-medium">Product is in stock</span>
    </label>
  );
};

const SelectedColors = () => {
  const { values, setFieldValue } = useFormikContext<{ colors: string[] }>();

  return (
    <div className="flex flex-wrap gap-2">
      {values.colors.length === 0 ? (
        <span>No colors selected</span>
      ) : (
        values.colors.map((color) => (
          <span
            key={color}
            className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
          >
            <span
              className="h-4 w-4 rounded-sm border"
              style={{
                backgroundColor: color,
              }}
            />
            {color}
            <button
              type="button"
              onClick={() =>
                setFieldValue(
                  "colors",
                  values.colors.filter((item) => item !== color)
                )
              }
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${color}`}
            >
              <X size={12} />
            </button>
          </span>
        ))
      )}
    </div>
  );
};

const CustomColorPicker = () => {
  const { values, setFieldValue } = useFormikContext<{ colors: string[] }>();
  const [hexValue, setHexValue] = useState("#000000");
  const normalizedHex = hexValue.trim().toUpperCase();
  const isValidHex = /^#[0-9A-F]{6}$/i.test(normalizedHex);
  const alreadySelected = values.colors.includes(normalizedHex);

  const updateHexValue = (value: string) => {
    const nextValue = value.startsWith("#") ? value : `#${value}`;
    setHexValue(nextValue.toUpperCase());
  };

  const addColor = () => {
    if (!isValidHex || alreadySelected) return;
    setFieldValue("colors", [...values.colors, normalizedHex]);
  };

  return (
    <div className="rounded-md border p-3 space-y-2">
      <Label>Custom Hex Color</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidHex ? normalizedHex : "#000000"}
          onChange={(event) => updateHexValue(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded border bg-transparent p-1"
          aria-label="Pick custom product color"
        />
        <input
          type="text"
          value={hexValue}
          onChange={(event) => updateHexValue(event.target.value)}
          placeholder="#B89146"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          maxLength={7}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addColor}
          disabled={!isValidHex || alreadySelected}
          className="h-10 gap-2"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
      {!isValidHex && (
        <p className="text-xs text-destructive">
          Enter a valid 6-digit hex code, for example #B89146.
        </p>
      )}
      {alreadySelected && (
        <p className="text-xs text-muted-foreground">
          This color is already selected.
        </p>
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
            src={convertS3ToImageKit(values.bannerImage)}
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
                src={convertS3ToImageKit(image)}
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
