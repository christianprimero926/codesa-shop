import { ImageLoaderConfig } from '@angular/common';

const PICSUM_URL = /^https:\/\/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)$/;

/**
 * Las imágenes del catálogo vienen de picsum con un tamaño fijo (600x450).
 * Este loader pide el ancho que realmente necesita cada pantalla, manteniendo la proporción.
 */
export function picsumImageLoader(config: ImageLoaderConfig): string {
  const match = PICSUM_URL.exec(config.src);
  if (!match || !config.width) {
    return config.src;
  }
  const [, seed, width, height] = match;
  const scaledHeight = Math.round((config.width * Number(height)) / Number(width));
  return `https://picsum.photos/seed/${seed}/${config.width}/${scaledHeight}`;
}
