/** Cookie carrying a one-shot "saved" toast from a server action to the next render. */
export const FLASH_COOKIE = 'pr_flash';

/** base64url keeps Arabic text cookie-safe without relying on the framework's encoding. */
export const encodeFlash = (message: string) => `${Date.now()}.${Buffer.from(message).toString('base64url')}`;

export function decodeFlash(value: string | undefined): { id: string; message: string } | null {
  if (!value) return null;
  const [id, body] = value.split('.');
  if (!id || !body) return null;
  try {
    return { id, message: Buffer.from(body, 'base64url').toString('utf8') };
  } catch {
    return null;
  }
}
