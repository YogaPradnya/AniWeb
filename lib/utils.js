export function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function fixImageUrl(url) {
  if (!url) return "";
  
  // 1. Jika sudah diproxy oleh wsrv.nl, kita kembalikan apa adanya
  if (url.includes('wsrv.nl/?url=')) {
    return url;
  }

  // 2. Tangani double protocol/hostname (Common upstream bug)
  // Contoh: https://xyz-api.animein.nethttps://api.animein.net/assets/...
  if (url.includes('http') && url.lastIndexOf('http') > 0) {
    url = url.substring(url.lastIndexOf('http'));
  }

  // 3. Normalisasi hostname ke xyz-api jika masih api.animein.net
  if (url.includes('api.animein.net') && !url.includes('xyz-api.animein.net')) {
    url = url.replace('api.animein.net', 'xyz-api.animein.net');
  }
  
  // 4. Fix double slash .net//assets
  url = url.replace(/net\/\/assets/g, 'net/assets');

  // 5. WAJIB: Bungkus dengan Image Proxy wsrv.nl untuk bypass 403
  // Hanya jika domainnya adalah animein.net
  if (url.includes('animein.net')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=80`;
  }

  return url;
}
