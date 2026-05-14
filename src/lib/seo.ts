import type { Metadata } from "next";

const base = "https://toolrent.lt";

export function buildMeta(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${base}${opts.path ?? ""}`;
  const image = opts.image ?? `${base}/og-default.png`;

  return {
    title: `${opts.title} – Rente`,
    description: opts.description,
    metadataBase: new URL(base),
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Rente",
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}
