import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Siirt Genç Kart",
    short_name: "SGK",
    description: "Ankara üniversite öğrencileri için dijital indirim kartı.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c2340",
    theme_color: "#0c2340",
    lang: "tr",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
