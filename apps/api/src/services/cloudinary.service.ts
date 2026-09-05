import crypto from 'node:crypto';

import { env } from '@wellness/config';
import { BadRequestError } from '@wellness/utils';

export class CloudinaryService {
  /**
   * Upload an image (URL, base64 data URI, or path) to Cloudinary.
   * Returns the secure Cloudinary URL.
   */
  async uploadImage(fileSource: string, folder = 'wellness_catalog'): Promise<string> {
    if (!fileSource || typeof fileSource !== 'string' || fileSource.trim() === '') {
      throw new BadRequestError('Invalid image source provided');
    }

    const trimmed = fileSource.trim();

    // If it's already a full Cloudinary URL, return as-is
    if (
      trimmed.startsWith('https://res.cloudinary.com/') ||
      trimmed.startsWith('http://res.cloudinary.com/')
    ) {
      return trimmed;
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'dqlu0d3xx';
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    try {
      const formData = new URLSearchParams();
      formData.append('file', trimmed);

      if (apiKey && apiSecret) {
        // Signed Upload
        const secret: string = apiSecret;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign: Record<string, string> = {
          folder,
          timestamp,
        };

        const sortedKeys = Object.keys(paramsToSign).sort();
        const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k] ?? ''}`).join('&');
        const signature = crypto
          .createHash('sha1')
          .update(stringToSign + secret)
          .digest('hex');

        formData.append('folder', folder);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('signature', signature);
      } else {
        // Unsigned Upload
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Cloudinary upload warning:', response.status, errorText);

        let detailedMsg = response.statusText;
        try {
          const parsed = JSON.parse(errorText) as { error?: { message?: string } };
          if (parsed.error?.message) {
            detailedMsg = parsed.error.message;
          }
        } catch {
          // ignore JSON parse error
        }

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        throw new BadRequestError(`Failed to upload image to Cloudinary: ${detailedMsg}`);
      }

      const result = (await response.json()) as { secure_url?: string };
      if (!result.secure_url) {
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        throw new BadRequestError('Cloudinary response did not contain secure_url');
      }

      return result.secure_url;
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      console.error('Cloudinary API error:', err);
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      throw new BadRequestError(
        err instanceof Error ? err.message : 'Failed to upload image to Cloudinary',
      );
    }
  }

  /**
   * Upload multiple images in sequence and return array of Cloudinary URLs.
   */
  async uploadMultipleImages(
    fileSources: string[],
    folder = 'wellness_catalog',
  ): Promise<string[]> {
    const urls: string[] = [];
    for (const src of fileSources) {
      const url = await this.uploadImage(src, folder);
      urls.push(url);
    }
    return urls;
  }
}

export const cloudinaryService = new CloudinaryService();
