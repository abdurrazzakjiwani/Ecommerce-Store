import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 *
 * `twMerge` matters here: without it a caller passing `className="p-4"` to a
 * component whose base already has `p-3` ends up with both, and which one wins
 * depends on stylesheet order rather than intent.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
