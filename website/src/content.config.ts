import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const homepageCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/homepage" }),
  schema: z.object({
    banner: z.object({
      title: z.string(),
      subtitle: z.string(),
      content: z.string(),
      enable_bg_pattern: z.boolean().default(true),
      image: z.string(),
      search: z.object({
        enable: z.boolean().default(true),
        input_placeholder: z.string(),
        button_text: z.string(),
      }),
    }),
    topics: z.object({
      title: z.string(),
      subtitle: z.string(),
    }),
    faq: z.object({
      enable: z.boolean().default(true),
      title: z.string(),
      subtitle: z.string(),
      content: z.string(),
      button: z.object({
        enable: z.boolean().default(true),
        label: z.string(),
        link: z.string(),
      }),
    }),
    header_alt: z.boolean().default(false),
  }),
});

const faqCollection = defineCollection({
  loader: glob({ pattern: "faq.{md,mdx}", base: "src/content/landing-pages" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    draft: z.boolean(),
    faq_items: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    ),
  }),
});

const ctaCollection = defineCollection({
  loader: glob({
    pattern: "call-to-action.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    subTitle: z.string(),
    content: z.string(),
    subscribe_field: z.object({
      placeholder: z.string(),
      enable: z.boolean(),
      button: z.object({
        label: z.string(),
      }),
    }),
  }),
});

const docsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    weight: z.number(),
    icon: z.string().optional(),
    type: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/regular-pages" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    header_alt: z.boolean().optional(),
    page: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          tag: z.string().optional(),
          button: z.object({
            label: z.string(),
            link: z.string(),
          }),
        }),
      )
      .optional(),
    note: z.string().optional(),
  }),
});

const landingCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/landing-pages" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    header_alt: z.boolean().optional(),
    faq_items: z
      .array(
        z.object({
          title: z.string(),
          content: z.string(),
        }),
      )
      .optional(),
    page: z.string().optional(),
    contact_info: z
      .object({
        location: z.string(),
        email: z.object({
          title: z.string(),
          contact: z.string().email(),
        }),
        phone: z.object({
          title: z.string(),
          contact: z.string(),
        }),
      })
      .optional(),
  }),
});

// Export collections
export const collections = {
  homepage: homepageCollection,
  faq: faqCollection,
  docs: docsCollection,
  "call-to-action": ctaCollection,
  "regular-pages": pagesCollection,
  "landing-pages": landingCollection,
};
