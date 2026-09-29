const imageModules = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const imagesByPath: Record<string, string> = Object.fromEntries(
  Object.entries(imageModules).map(([key, url]) => [key.replace('../assets/images', ''), url])
);

/**
 * Resolves an image path stored in the product catalogue (e.g. "/zx9/main.png")
 * to the hashed URL emitted by the bundler.
 */
export const getImage = (path?: string): string => {
  if (!path) return '';
  return imagesByPath[path] ?? '';
};

export const getProductImage = (path?: string): string => {
  if (!path) return '';
  return getImage(`/products${path}`);
};
