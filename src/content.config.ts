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
      author: z.string(),
      cover: z
        .object({
          image: image(),
          alt: z.string(),
        })
        .optional(),
      tags: z.array(z.string()),
      draft: z.boolean().default(false),
      history: z
        .array(
          z.object({
            datetime: z.coerce.date(),
            note: z.string(),
          }),
        )
        .optional(),
      credits: z
        .array(
          z.object({
            label: z.string(),
            text: z.string(),
            url: z.string().url().optional(),
          }),
        )
        .optional(),
    }),
});

export const collections = { posts };
