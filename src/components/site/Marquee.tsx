type MarqueeProps = {
  items: string[];
  className?: string;
};

// Cinta de texto inclinada en loop infinito. Puro CSS (motion-safe: en
// globals.css) — no hace falta JS para animar contenido decorativo
// que se repite sin parar.
export function Marquee({ items, className }: MarqueeProps) {
  const content = [...items, ...items];

  return (
    // overflow-hidden va en un wrapper SIN transformar: un elemento no
    // puede clipar su propia geometría ya skewed, solo la de sus hijos.
    // Con el skew y el overflow-hidden juntos, el borde inclinado sangra
    // unos px más allá del viewport y genera scroll horizontal.
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div className="skew-slant border-y-2 border-surface bg-primary py-3">
        <div className="motion-safe:animate-marquee flex w-max gap-4 whitespace-nowrap">
          {content.map((item, i) => (
            <span
              key={i}
              className="font-display text-headline-sm uppercase text-on-primary"
            >
              {item}
              <span className="mx-4 text-on-primary/50">{"///"}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
