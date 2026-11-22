export function ContentPage({ eyebrow, title, intro, sections, notice }: {
  eyebrow?: string; title: string; intro?: string; notice?: string;
  sections: { h: string; p?: string; list?: string[] }[];
}) {
  return (
    <article className="container-luxe max-w-3xl py-14 md:py-20">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="heading-display mt-3 text-4xl md:text-6xl">{title}</h1>
      {intro && <p className="mt-6 text-lg leading-relaxed text-smoke">{intro}</p>}
      {notice && <p className="mt-6 border-s-2 border-gold bg-ivory px-4 py-3 text-sm text-graphite">{notice}</p>}
      <div className="prose-luxe mt-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.list && <ul>{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
          </section>
        ))}
      </div>
    </article>
  );
}
