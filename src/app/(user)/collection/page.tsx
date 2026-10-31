import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getCollections } from "@/lib/collections";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "The Collections",
  description: "Each chapter of the house, gathered in one place. Explore the collections of Haus of Privae.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.hausofprivae.com"}/collection/` },
};

export default async function CollectionPage() {
  const collections = await getCollections();
  return (
    <main className="bg-background min-h-[65vh] px-5 py-8 md:px-10 md:py-12 lg:px-12">
      <div className="max-w-[1500px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-3 text-muted-foreground font-body text-[10px] md:text-xs tracking-[0.25em] uppercase"><ArrowLeft size={15} />Back to home</Link>
        <header className="text-center pt-12 pb-14 md:pt-14 md:pb-20">
          <p className="text-gold font-body text-[10px] md:text-xs tracking-[0.35em] uppercase">The House Archive</p>
          <h1 className="font-heading text-5xl md:text-7xl mt-4">The Collections</h1>
          <div className="w-12 h-px bg-gold/60 mx-auto my-6" />
          <p className="font-body font-light text-muted-foreground text-sm md:text-lg leading-relaxed max-w-5xl mx-auto">Each chapter of the house, gathered in one place. Step into a collection to see every piece within it.</p>
        </header>
        {collections.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {collections.map(item => {
            const content = <>
              <div className="relative aspect-[8/5] overflow-hidden bg-muted">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {item.label && <span className="absolute z-10 left-5 top-5 md:left-6 md:top-6 bg-background/95 px-4 py-3 text-primary font-body text-[10px] md:text-xs uppercase tracking-[0.25em]">{item.label}</span>}
                {item.isComingSoon && <div className="absolute inset-0 bg-black/55 flex items-center justify-center"><span className="font-heading text-4xl md:text-5xl text-white">In the making</span></div>}
              </div>
              <div className="px-5 py-9 md:px-8 md:py-11 text-center flex flex-col flex-1 items-center">
                <h2 className="font-heading text-3xl md:text-[40px] leading-tight">{item.name}</h2>
                {item.tagline && <p className="text-gold font-body text-[10px] md:text-xs uppercase tracking-[0.25em] mt-4">{item.tagline}</p>}
                {item.description && <p className="text-muted-foreground font-body font-light text-sm md:text-base leading-relaxed mt-6 max-w-xl whitespace-pre-line">{item.description}</p>}
                <div className="pt-10 mt-auto"><span className="inline-flex items-center gap-2 border-b border-primary/40 pb-2 font-body text-[10px] md:text-xs tracking-[0.23em] uppercase">{item.isComingSoon ? "Coming soon" : `Enter ${item.name} · ${item.productCount} ${item.productCount === 1 ? "piece" : "pieces"}`}{!item.isComingSoon && <ArrowUpRight size={14} />}</span></div>
              </div>
            </>;
            const cardClass = "group border border-border/70 flex flex-col";
            return item.isComingSoon
              ? <article key={item.id} aria-label={`${item.name} — coming soon`} className={cardClass}>{content}</article>
              : <Link key={item.id} href={`/collection/${item.slug}`} className={`${cardClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>{content}</Link>;
          })}
        </div> : <div className="text-center border border-border/70 py-20 mb-12"><h2 className="font-heading text-3xl">A new chapter is taking shape</h2><p className="font-body text-sm text-muted-foreground mt-4">Our collections will appear here soon.</p><Link href="/product" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-primary/40 pb-2 mt-8">Explore all pieces</Link></div>}
      </div>
    </main>
  );
}
