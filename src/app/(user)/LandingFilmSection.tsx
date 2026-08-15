const landingFilms = [
  {
    title: "The Drape",
    label: "Film 01",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Video2.mp4",
  },
  {
    title: "The Detail",
    label: "Film 02",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Video1.mp4",
  },
];

export default function LandingFilmSection() {
  return (
    <section className="px-4 py-16 md:py-24 bg-background">
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div className="max-w-md">
            <p className="eyebrow mb-3">In Motion</p>
            <h2 className="font-heading text-3xl md:text-5xl text-foreground leading-tight">
              Crafted to be seen from every angle
            </h2>
            <div className="section-rule !mx-0 my-6" />
            <p className="font-body text-sm leading-7 text-muted-foreground">
              Two quiet campaign moments from the atelier, following the fall
              of fabric, finish of handwork, and the feeling of occasionwear in
              motion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
            {landingFilms.map((film, index) => (
              <article
                key={film.src}
                className={`group relative overflow-hidden bg-muted shadow-sm aspect-[4/5] ${
                  index === 1 ? "sm:mt-12" : ""
                }`}
              >
                <video
                  src={film.src}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-primary-foreground">
                  <span className="font-body text-[10px] uppercase tracking-[0.25em]">
                    {film.label}
                  </span>
                  <span className="h-px w-10 bg-primary-foreground/60" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="font-heading text-2xl md:text-3xl leading-none text-primary-foreground">
                    {film.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
