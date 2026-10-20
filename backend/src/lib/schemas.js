import { z } from 'zod';

// Convierte '' en null para campos opcionales que llegan de formularios.
const emptyToNull = (schema) => z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), schema);

// Solo URLs http(s): evita enlaces `javascript:` en imágenes o fuentes.
export const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url('URL inválida')
  .refine((u) => /^https?:\/\//i.test(u), 'Debe empezar con http:// o https://');

export const email = z.string().trim().toLowerCase().max(160).email('Correo inválido');

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
    email,
    // bcrypt solo usa los primeros 72 bytes
    password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'Requerido').max(72),
  })
  .strict();

export const articleSchema = z
  .object({
    title: z.string().trim().min(3, 'Mínimo 3 caracteres').max(200),
    slug: emptyToNull(z.string().trim().toLowerCase().max(160).regex(SLUG_RE, 'Solo minúsculas, números y guiones').nullable()).optional(),
    category: z.string().trim().min(2).max(40).transform((s) => s.toUpperCase()),
    subtitle: z.string().trim().max(400).default(''),
    content: z.string().max(50_000).default(''),
    image_url: emptyToNull(httpUrl.nullable()).optional(),
    read_minutes: z.coerce.number().int().min(1).max(120).default(3),
    source_text: emptyToNull(z.string().trim().max(200).nullable()).optional(),
    source_url: emptyToNull(httpUrl.nullable()).optional(),
    published: z.boolean().default(true),
  })
  .strict();

export const commentSchema = z
  .object({
    body: z.string().trim().min(1, 'Escribe un comentario').max(2000, 'Máximo 2000 caracteres'),
  })
  .strict();

export const SECTIONS = ['sintomas', 'ciclo', 'manejo', 'mision', 'equipo', 'servicios'];

export const contentItemSchema = z
  .object({
    section: z.enum(SECTIONS),
    title: z.string().trim().min(1, 'Requerido').max(200),
    body: z.string().trim().max(5000).default(''),
    position: z.coerce.number().int().min(0).max(10_000).default(0),
  })
  .strict();

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
    email,
    message: z.string().trim().min(5, 'Mínimo 5 caracteres').max(4000),
    website: z.string().max(200).optional(), // honeypot anti-spam: debe quedar vacío
  })
  .strict();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});
