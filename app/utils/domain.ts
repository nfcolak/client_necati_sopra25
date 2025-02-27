import { isProduction } from "@/utils/environment";

/**
 * Returns the API base URL based on the current environment.
 * In production, it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded URL).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://airy-semiotics-452211-k1.oa.r.appspot.com"; // Güncellenmiş üretim URL'si
  const devUrl = "http://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
}
