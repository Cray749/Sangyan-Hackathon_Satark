import type { MetadataRoute } from "next";

// Lets a phone "install" Satark to the home screen. No app store, no sign-up.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Satark - Pause before you pay",
    short_name: "Satark",
    description: "Follows an investment scam stage by stage and tells you the one thing to do now.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3ead8",
    theme_color: "#f3ead8",
    lang: "hi",
    // "Share" from WhatsApp straight into Satark. The text is sent as a POST that only the
    // service worker sees, so it never shows up in a web address or a server log.
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url" },
    },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
