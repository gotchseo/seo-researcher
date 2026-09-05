export interface EmbeddedAsset { contentType: string; body: string; encoding?: string }

export function embeddedSiteResponse(url: URL, assets: Record<string, EmbeddedAsset>): Response | null {
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const candidates = [pathname, `${pathname.replace(/\/$/, '')}/index.html`];
  const asset = candidates.map(candidate => assets[candidate]).find(Boolean);
  if (!asset) return null;
  const isDownload = url.pathname.startsWith('/downloads/');
  const headers = new Headers({
    'content-type': asset.contentType,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'cache-control': asset.contentType.startsWith('text/html') || isDownload ? 'public, max-age=300' : 'public, max-age=31536000, immutable',
  });
  if (isDownload && asset.contentType === 'application/zip') {
    headers.set('content-disposition', `attachment; filename="${url.pathname.split('/').pop()!.replace(/[^a-zA-Z0-9.-]/g, '')}"`);
  }
  const body = asset.encoding === 'base64' || (!asset.encoding && asset.contentType === 'application/octet-stream')
    ? Uint8Array.from(atob(asset.body), char => char.charCodeAt(0))
    : asset.body;
  return new Response(body, { headers });
}
