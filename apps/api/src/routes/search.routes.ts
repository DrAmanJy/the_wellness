import { Router } from 'express';

import {
  bindProcedure,
  searchCatalogProcedure,
  searchSuggestionsProcedure,
} from '@wellness/contracts';
import { asyncHandler } from '@wellness/utils';

import { searchCatalog, searchSuggestions } from '../controllers/search.controller';

const router = Router();

bindProcedure(
  router,
  searchCatalogProcedure,
  asyncHandler((req, res, next) => searchCatalog(req, res, next)),
);

bindProcedure(
  router,
  searchSuggestionsProcedure,
  asyncHandler((req, res, next) => searchSuggestions(req, res, next)),
);

export { router as searchRoutes };
export default router;
