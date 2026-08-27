import { Router } from 'express';

import { asyncHandler } from '@wellness/utils';

import { searchCatalog, searchSuggestions } from '../controllers/search.controller';

const router = Router();

router.get(
  '/',
  asyncHandler((req, res, next) => searchCatalog(req, res, next)),
);
router.get(
  '/suggestions',
  asyncHandler((req, res, next) => searchSuggestions(req, res, next)),
);

export const searchRoutes = router;
