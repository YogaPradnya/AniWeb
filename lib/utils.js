export function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function fixImageUrl(url) {
  if (!url) return "/no-image.jpg";
  
  // 1. Ekstrak URL asli jika sebelumnya diproxy oleh wsrv.nl
  if (url.includes('wsrv.nl/?url=')) {
    url = decodeURIComponent(url.split('wsrv.nl/?url=')[1]);
  }

  // 2. Tangani double protocol/hostname (Common upstream bug)
  if (url.includes('http') && url.lastIndexOf('http') > 0) {
    const lastHttp = url.lastIndexOf('http');
    url = url.substring(lastHttp);
  }

  // 3. Normalisasi hostname ke xyz-api jika masih api.animein.net
  if (url.includes('api.animein.net') && !url.includes('xyz-api.animein.net')) {
    url = url.replace('api.animein.net', 'xyz-api.animein.net');
  }
  
  // 4. Fix double slash .net//assets
  url = url.replace(/net\/\/assets/g, 'net/assets');

  // 5. Kembalikan proxy internal kita
  if (url.startsWith('http')) {
    // Hindari double encoding jika sudah ada proxy kita
    if (url.startsWith('/api/image')) return url;
    return `/api/image?url=${encodeURIComponent(url)}`;
  }

  return url;
}
