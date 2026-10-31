import Link from "next/link";

export default function CollectionNotFound() {
  return <main className="container mx-auto px-6 py-24 text-center"><p className="font-body text-xs tracking-[0.25em] uppercase text-gold">The House Archive</p><h1 className="font-heading text-5xl mt-5">Collection unavailable</h1><p className="font-body text-muted-foreground mt-5">This chapter of the house is not open yet or is no longer available.</p><Link href="/collection" className="inline-block mt-8 border-b border-primary/40 pb-2 font-body text-xs uppercase tracking-[0.2em]">Explore the collections</Link></main>;
}
