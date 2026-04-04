import { defineCollection } from 'astro:content';
import { z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    basename: z.string(),
    sourceUrl: z.string(),
    legacyUrl: z.string(),
    categories: z.array(z.string()),
    image: z.string().optional(),
    cardImage: z.string().optional(),
  }),
});

export const collections = { blog };
