import markdoc from "@astrojs/markdoc";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import remarkToc from "remark-toc";
import sharp from "sharp";
import config from "./src/config/config.json";

export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharp() },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    sitemap(),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
        "@/shortcodes/Code",
        "@/shortcodes/Badge",
        "@/shortcodes/CardCtaContainer",
        "@/shortcodes/CardCta",
        "@/shortcodes/Figure",
        "@/shortcodes/CardContainer",
        "@/shortcodes/Card",
        "@/shortcodes/AccordionWrapper",
        "@/shortcodes/Images",
        "@/shortcodes/PricingWrapper",
      ],
    }),
    mdx(),
    markdoc(),
  ],
  markdown: {
    remarkPlugins: [
      [
        remarkToc,
        {
          heading: "contents",
        },
      ],
    ],
    rehypePlugins: [rehypeAccessibleEmojis, rehypeHeadingIds],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
});
