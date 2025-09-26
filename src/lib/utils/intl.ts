import { getTranslations } from 'next-intl/server';

export async function getAllTranslations(namespace: string) {
  const t = await getTranslations(namespace);
  // If t.getAll() is available (next-intl v3+)
  if (typeof t.getAll === 'function') {
    return t.getAll();
  }
  // Fallback: manually extract keys if needed
  // You may need to provide a list of keys or use your messages JSON
  throw new Error('t.getAll() is not available. Please upgrade next-intl.');
}
