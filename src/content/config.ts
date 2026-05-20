import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'Tagebuch',
      'Technik',
      'Tutorials',
      'Bug-Jagd',
      'Architektur',
      'DOM & Browser',
      'Engine',
      'Dashboard',
      'DevOps',
      'Academy',
    ]),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    image: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { articles, pages };
