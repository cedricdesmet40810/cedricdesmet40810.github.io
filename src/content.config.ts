import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    /** Los van de titel, zodat de zoekresultatenpagina kort blijft. */
    metaTitle: z.string().optional(),
    description: z.string().max(165),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Auxilia'),
    tag: z.string(),
    /** Geschatte leestijd in minuten. */
    readingTime: z.number().default(5),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
