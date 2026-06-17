
/**
 * A small, quiet "Notes from Jaipur" card — a personal note from the
 * atelier. Editable from Site Settings (homepage.notes_*).
 */
const NotesFromJaipur = () => {
    const enabled = true;
    if (!enabled) return null;

    const eyebrow = "From the Atelier";
    const title = "A note from Jaipur";
    const body = "This month marks our very first chapter — a summer edit of occasionwear born in the Jaipur atelier. Light hand-embroidered sets, fluid silks for long evenings, and pieces made for the season's soft mornings and louder nights. Thank you for being here at the beginning."
    const signature = "— The Privae Atelier";
    const date = "Jaipur · This Month";

    return (
        <section className="py-16 md:py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <article className="relative bg-card/60 backdrop-blur-sm border border-gold/20 rounded-sm px-8 md:px-14 py-10 md:py-14 shadow-sm">
                    {/* Decorative gold corners */}
                    <span aria-hidden className="absolute top-0 left-0 w-6 h-px bg-gold/60" />
                    <span aria-hidden className="absolute top-0 left-0 w-px h-6 bg-gold/60" />
                    <span aria-hidden className="absolute bottom-0 right-0 w-6 h-px bg-gold/60" />
                    <span aria-hidden className="absolute bottom-0 right-0 w-px h-6 bg-gold/60" />

                    <div className="text-center">
                        <p className="eyebrow mb-3">{eyebrow}</p>
                        <h2 className="font-heading text-2xl md:text-4xl text-foreground mb-6 italic">
                            {title}
                        </h2>
                        <p className="font-heading italic text-base md:text-lg text-foreground/85 leading-relaxed max-w-2xl mx-auto">
                            {body}
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-1">
                            <span className="block w-12 h-px bg-gold/40 mb-3" />
                            <p className="font-heading italic text-sm md:text-base text-primary">{signature}</p>
                            <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-body mt-1">
                                {date}
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
};

export default NotesFromJaipur;
