import type { CategoryListDTO, CategoryDetailDTO, CategoryMutationDTO } from '@wellness/contracts';
import type { categories } from '@wellness/db';

export function toCategoryListDTO(category: typeof categories.$inferSelect): CategoryListDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
  };
}

export function toCategoryDetailDTO(category: typeof categories.$inferSelect): CategoryDetailDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toCategoryMutationDTO(
  category: typeof categories.$inferSelect,
): CategoryMutationDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
