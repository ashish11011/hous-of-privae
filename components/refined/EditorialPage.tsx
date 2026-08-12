import Link from "next/link";
import { ReactNode } from "react";

export function EditorialPage({
  eyebrow,
  title,
  description,
  children,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <main className="bg-background text-foreground">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="font-heading text-4xl md:text-6xl heading-rule">
            {title}
          </h1>
          <p className="mx-auto mt-7 text-sm md:text-base font-body text-muted-foreground leading-relaxed">
            {description}
          </p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-8 inline-flex border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cta.label}
            </Link>
          )}
        </div>
        {/* <div className="section-rule my-12" /> */}
        {children}
      </section>
    </main>
  );
}

export function EditorialGrid({
  items,
}: {
  items: { title: string; body: string; meta?: string }[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="border border-border bg-card p-6">
          {item.meta && (
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gold font-body">
              {item.meta}
            </p>
          )}
          <h2 className="font-heading text-2xl text-foreground mb-3">
            {item.title}
          </h2>
          <p className="font-body text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        </article>
      ))}
    </div>
  );
}
