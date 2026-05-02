import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges tailwind classes intelligently.
 * Combines the features of clsx (conditional classes) and tailwind-merge (resolving conflicts).
 * 
 * @param  {...import("clsx").ClassValue} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
