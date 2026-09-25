"use client";
import { LabelInput, LabelTextarea, Select, UploadFile } from "@/components/index";
import { Button } from "@/components/ui/button";
import { SIZES } from "@/const/globalConstants";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductRecord } from "@/lib/productAdapter";
import type { SizePrice } from "@/lib/productPricing";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

type VariantInput = { id?: string; color: string; bannerImage: string; images: string[] };
type Fields = { pricingConfig: SizePrice[]; variants: VariantInput[]; isInStoke: boolean };
export default function ProductEdit({ productData, slug, categories = [] }: { productData?: ProductRecord | null; slug: string; categories: { id: string; name: string; level: number }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const initialValues = {
    name: productData?.name ?? "", sku: productData?.sku ?? "", slug: productData?.slug ?? "",
    fabric: productData?.fabric ?? "", description: productData?.description ?? "", care: productData?.care ?? "",
    style_note: productData?.style_note ?? "", customization: productData?.customization ?? "", model_height: productData?.model_height ?? "",
    categoryId1: productData?.categoryId1 ?? "", categoryId2: productData?.categoryId2 ?? "",
    materials: productData?.materials ?? [], isInStoke: productData?.isInStoke ?? true,
    pricingConfig: SIZES.map(size => productData?.pricingConfig.find(row => row.size === size) ?? { size, basePrice: 0, strikethroughPrice: null, isVisible: false }),
    variants: productData?.variants.map(variant => ({ id: variant.id, color: variant.color, bannerImage: variant.bannerImage, images: variant.images ?? [] })) ?? [{ color: "", bannerImage: "", images: [] }],
  };
  async function archive() {
    setArchiving(true); setError("");
    try {
      const response = await fetch("/api/admin/products/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.msg || "Could not archive product");
      router.push("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not archive product"); }
    finally { setArchiving(false); }
  }
  return <main className="p-4 md:p-8 min-w-0 w-full max-w-5xl">
    <h1 className="text-3xl mb-6">{slug === "create" ? "Create product" : "Edit product"}</h1>
    {error && <p role="alert" className="text-red-700 bg-red-50 p-4 mb-4">{error}</p>}
    <Formik initialValues={initialValues} onSubmit={async values => {
      setError("");
      try {
        const response = await fetch(`/api/admin/products/${slug === "create" ? "create" : "update"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.msg || "Could not save product");
        router.push("/admin"); router.refresh();
      } catch (error) { setError(error instanceof Error ? error.message : "Could not save product"); }
    }}>{({ isSubmitting }) => <Form className="space-y-8">
      <fieldset disabled={isSubmitting || archiving} className="space-y-8 disabled:opacity-70">
        <div className="grid sm:grid-cols-2 gap-4"><LabelInput name="name" labelName="Product name" /><LabelInput name="sku" labelName="SKU" /><LabelInput name="fabric" labelName="Fabric" /><LabelInput name="model_height" labelName="Model height" /></div>
        <LabelTextarea name="description" labelName="Description" />
        <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map(level => <Select key={level} labelName={`Category level ${level}`} name={`categoryId${level}`} placeholder="Select category" options={categories.filter(category => category.level === level).map(category => ({ value: category.id, label: category.name }))} />)}</div>
        <SizePricing />
        <VariantsEditor />
        <LabelTextarea name="care" labelName="Care" /><LabelTextarea name="style_note" labelName="Style notes" /><LabelTextarea name="customization" labelName="Customization" />
        <ProductOptions />
        <div className="flex gap-3"><Button type="submit">{isSubmitting ? "Saving…" : "Save product"}</Button>{slug !== "create" && <Button type="button" variant="destructive" onClick={archive}>Archive product</Button>}</div>
      </fieldset>
    </Form>}</Formik>
  </main>;
}
function SizePricing() {
  const { values, setFieldValue } = useFormikContext<Fields>();
  return <section><h2 className="text-2xl mb-2">Size pricing</h2><p className="text-sm text-muted-foreground mb-4">Base price is charged. Only visible sizes can be purchased. A comparison price is crossed out only when it is higher than the base price.</p>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-2">Size</th><th>Base price (₹)</th><th>Comparison price (₹)</th><th>Visible</th></tr></thead><tbody>{values.pricingConfig.map((row, index) => <tr key={row.size} className="border-b"><th className="p-3 uppercase text-left">{row.size}</th>{(["basePrice", "strikethroughPrice"] as const).map(field => <td key={field} className="p-2"><input aria-label={`${row.size} ${field}`} type="number" min="0" step="1" className="border rounded p-2 w-32" value={row[field] ?? ""} onChange={event => setFieldValue(`pricingConfig.${index}.${field}`, event.target.value === "" && field === "strikethroughPrice" ? null : Number(event.target.value))} /></td>)}<td><input aria-label={`Show size ${row.size}`} type="checkbox" checked={row.isVisible} onChange={event => setFieldValue(`pricingConfig.${index}.isVisible`, event.target.checked)} /></td></tr>)}</tbody></table></div>
  </section>;
}
function ProductOptions() {
  const { values, setFieldValue } = useFormikContext<Fields & { materials: string[] }>();
  return <div className="space-y-4"><label className="flex gap-3"><input type="checkbox" checked={values.isInStoke} onChange={event => setFieldValue("isInStoke", event.target.checked)} />In stock</label><label className="block">Materials (comma separated)<input className="block border p-2 w-full" value={values.materials.join(", ")} onChange={event => setFieldValue("materials", event.target.value.split(",").map(value => value.trim()))} /></label></div>;
}
function VariantsEditor() {
  const { values, setFieldValue } = useFormikContext<Fields>();
  return <section><h2 className="text-2xl mb-2">Color variants</h2><p className="text-sm text-muted-foreground mb-4">Each variant has its own storefront card and image gallery. Size prices are shared across this product.</p>
    <FieldArray name="variants">{({ push, remove }) => <div className="space-y-5">{values.variants.map((variant, index) => <div key={variant.id ?? index} className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between gap-4"><h3 className="text-lg">Variant {index + 1}</h3><Button type="button" variant="outline" disabled={values.variants.length === 1} onClick={() => remove(index)}>Remove variant</Button></div>
      <LabelInput name={`variants.${index}.color`} labelName="Color name or hex code" placeholder="#800080" />
      <div><p className="text-sm mb-2">Card / banner image</p>{variant.bannerImage && <div className="w-32 mb-2"><ImageWithSkeleton src={variant.bannerImage} alt={`Variant ${index + 1}`} wrapperClassName="aspect-[3/4]" /></div>}<UploadFile onChange={(url: string) => setFieldValue(`variants.${index}.bannerImage`, url)} /><LabelInput name={`variants.${index}.bannerImage`} labelName="Or enter image URL" /></div>
      <div><p className="text-sm mb-2">Gallery images</p><div className="flex flex-wrap gap-3">{variant.images.map((url, imageIndex) => <div key={`${url}-${imageIndex}`} className="w-28"><ImageWithSkeleton src={url} alt={`Gallery image ${imageIndex + 1}`} wrapperClassName="aspect-[3/4]" /><button type="button" className="text-xs underline" onClick={() => setFieldValue(`variants.${index}.images`, variant.images.filter((_, i) => i !== imageIndex))}>Remove image</button></div>)}</div><UploadFile onChange={(url: string) => setFieldValue(`variants.${index}.images`, [...variant.images, url])} /></div>
    </div>)}<Button type="button" variant="outline" onClick={() => push({ color: "", bannerImage: "", images: [] })}>Add color variant</Button></div>}</FieldArray>
  </section>;
}
