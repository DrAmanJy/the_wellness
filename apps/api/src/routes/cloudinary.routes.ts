import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { asyncHandler } from '@wellness/utils';

import { logger } from '../lib/logger';
import { cloudinaryService } from '../services/cloudinary.service';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  '/upload',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  upload.single('file') as any,
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    let fileSource: string;
    const body = req.body as Record<string, unknown> | undefined;
    const folder = typeof body?.folder === 'string' ? body.folder : 'wellness_catalog';

    if (req.file) {
      const mime = req.file.mimetype || 'image/jpeg';
      const base64 = req.file.buffer.toString('base64');
      fileSource = `data:${mime};base64,${base64}`;
    } else if (typeof body?.file === 'string' && body.file.trim().length > 0) {
      fileSource = body.file;
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'No file provided in form-data field "file" or body field "file"' },
      });
    }

    try {
      const url = await cloudinaryService.uploadImage(fileSource, folder);
      return res.json({
        success: true,
        url,
      });
    } catch (err) {
      logger.error({ err }, 'Cloudinary upload route error');
      return res.status(400).json({
        success: false,
        error: { message: err instanceof Error ? err.message : 'Failed to upload image' },
      });
    }
  }),
);

export default router;
