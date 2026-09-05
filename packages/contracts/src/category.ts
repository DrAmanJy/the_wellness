export type CategoryListDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

export type CategoryDetailDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryMutationDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
