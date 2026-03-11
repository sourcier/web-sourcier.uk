import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: ["*.md", "**/*.md"], base: "./collections/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subTitle: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string(),
      cover: z.object({
        image: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()),
    }),
});

export const collections = { posts };
