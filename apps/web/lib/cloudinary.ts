export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqlu0d3xx';

export const CLOUDINARY_IMAGES = {
  heroBottle: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/hero_bottle.jpg',
  cardioStatin: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/cardiostatin.jpg',
  neuroProtect: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/neuroprotect.jpg',
  osteoFlex: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/osteoflex.jpg',
  pediCare: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/pedicare.jpg',
  immunoGuard: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/immunoguard.jpg',
  dermaPure: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/dermapure.jpg',
  defaultBanner: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_banner.jpg',
  labResearch: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/lab_research.jpg',
  medicalTeam: 'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/medical_team.jpg',
  defaultProduct:
    'https://res.cloudinary.com/dqlu0d3xx/image/upload/v1/wellness/default_product.jpg',
};

export function getCloudinaryImageUrl(
  publicIdOrUrl?: string | null,
  fallback = CLOUDINARY_IMAGES.defaultProduct,
): string {
  if (!publicIdOrUrl || publicIdOrUrl.trim() === '') return fallback;
  if (
    publicIdOrUrl.startsWith('http://') ||
    publicIdOrUrl.startsWith('https://') ||
    publicIdOrUrl.startsWith('data:')
  ) {
    return publicIdOrUrl;
  }
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicIdOrUrl}`;
}
