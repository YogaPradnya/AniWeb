export function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function fixImageUrl(url) {
  if (!url) return "";
  
  // 1. Fix double hostname issue (Common API bug)
  // Example: https://xyz-api.animein.nethttps://api.animein.net/assets/...
  if (url.includes('https://xyz-api.animein.nethttps://api.animein.net')) {
    url = url.replace('https://xyz-api.animein.nethttps://api.animein.net', 'https://xyz-api.animein.net');
  }
  
  // 2. Normalize some other potential double-domain patterns
  if (url.startsWith('https://xyz-api.animein.nethttp')) {
     url = url.replace('https://xyz-api.animein.nethttp', 'http');
  }

  // 3. Ensure assets_xyz prefix if needed (based on guide)
  // If use direct assets/ and it's not working, we could try adding _xyz
  // but let's stick to cleaning the double first.

  return url;
}
