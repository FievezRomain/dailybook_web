import { z } from 'zod';

export const storedFilenameSchema = z.string().trim().min(1).max(255).refine(
  (value) => value !== '.' && value !== '..' && !/[\\/\u0000-\u001f\u007f]/.test(value),
  'Nom de fichier invalide.',
);
