import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCollectionBySlug } from "@/lib/collections";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";
const loadCollection = cache(getCollectionBySlug);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const item = await loadCollection((await params).slug);
  if (!item) return { title: "Collection unavailable", robots: { index: false, follow: false } };
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.hausofprivae.com"}/collection/${item.slug}/`;
  return {
    title: item.name,
    description: item.description || item.tagline,
    alternates: { canonical: url },
    openGraph: { title: `${item.name} | Haus of Privae`, description: item.description || item.tagline, url, images: [item.image] },
  };
}

export default async function CollectionDetail({ params }: Props) {
  const item = await loadCollection((await params).slug);
  if (!item) notFound();
  const pieces = new Set(item.products.map(product => product.id)).size;
  return <main className="bg-background min-h-[65vh] pb-20">
    <div className="container mx-auto px-5 md:px-10 pt-8 md:pt-12">
      <Link href="/collection" className="inline-flex items-center gap-3 text-muted-foreground font-body text-[10px] md:text-xs tracking-[0.25em] uppercase"><ArrowLeft size={15} />All collections</Link>
      <header className="text-center max-w-3xl mx-auto py-12 md:py-16">
        <p className="font-body text-gold text-xs tracking-[0.3em] uppercase">{item.label || "The House Collection"}</p>
        <h1 className="font-heading text-5xl md:text-7xl mt-4">{item.name}</h1>
        {item.tagline && <p className="font-body text-gold text-[10px] md:text-xs tracking-[0.25em] uppercase mt-6">{item.tagline}</p>}
        {item.description && <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line mt-6">{item.description}</p>}
      </header>
      <div className="relative h-56 md:h-96 overflow-hidden mb-12"><img src={item.image} alt={`${item.name} collection`} className="w-full h-full object-cover" /></div>
      {item.products.length ? <><p className="font-body text-xs text-muted-foreground uppercase tracking-[0.2em] border-b pb-5 mb-8">{pieces} {pieces === 1 ? "piece" : "pieces"} in this collection</p><div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">{item.products.map(product => <ProductCard key={product.variantId ?? product.id} product={product} />)}</div></> : <div className="text-center py-12"><h2 className="font-heading text-3xl">The pieces are being prepared</h2><p className="font-body text-muted-foreground text-sm mt-3">Check back soon to explore this collection.</p><Link href="/collection" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-primary/40 pb-2 mt-8">Explore the collections</Link></div>}
    </div>
  </main>;
}
