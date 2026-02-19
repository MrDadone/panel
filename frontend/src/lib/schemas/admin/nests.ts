import { z } from 'zod';
import { nullableString } from "@/lib/transformers.ts";

export const adminNestSchema = z.object({
  author: z.string().min(2).max(255),
  name: z.string().min(3).max(255),
  description: z.preprocess(nullableString, z.string().max(1024).nullable()),
});
