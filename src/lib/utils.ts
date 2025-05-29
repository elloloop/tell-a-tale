import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to find the latest available image version for a given date by checking which URLs exist
export async function findLatestAvailableImageUrl(
  date: string,
  maxVersion = 10
): Promise<string | null> {
  // Try v1.png up to v{maxVersion}.png, and return the highest version that exists
  let latestUrl: string | null = null;
  for (let v = 1; v <= maxVersion; v++) {
    const url = `/images/${date}/v${v}.png`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        latestUrl = url;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return latestUrl;
}
