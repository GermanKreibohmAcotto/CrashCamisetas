// Serializa un objeto schema.org a un <script type="application/ld+json">.
// JSON.stringify escapa comillas pero no "</script>" dentro de strings —
// reemplazarlo es lo que evita que un nombre de producto con esa
// secuencia rompa el tag que lo contiene.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
