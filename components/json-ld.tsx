type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps = {
  data: JsonLdValue;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
