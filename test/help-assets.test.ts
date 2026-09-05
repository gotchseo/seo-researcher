import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { embeddedSiteResponse } from '../worker/site-response';
import { EMBEDDED_SITE } from '../worker/embedded-site';

const manifest = JSON.parse(readFileSync('public/downloads/manifest.json', 'utf8')) as Array<{name:string;url:string;sha256:string;bytes:number}>;
describe('help center delivery', () => {
  it.each(['/help', '/help/', '/help/connect/claude', '/help/skills', '/help/workflows/write'])('serves built HTML at %s', async path => {
    const response = embeddedSiteResponse(new URL(path, 'https://seoresearcher.ai'), EMBEDDED_SITE);
    expect(response?.headers.get('content-type')).toContain('text/html');
    expect(await response?.text()).toContain('<h1');
  });
  it.each(manifest)('serves a byte-identical installable $name ZIP', async entry => {
    const response = embeddedSiteResponse(new URL(entry.url, 'https://seoresearcher.ai'), EMBEDDED_SITE)!;
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes).toEqual(readFileSync(`public${entry.url}`));
    expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
    expect(bytes.length).toBe(entry.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);
    expect(response.headers.get('content-type')).toBe('application/zip');
    expect(response.headers.get('content-disposition')).toContain(`${entry.name}.zip`);
    expect(response.headers.get('cache-control')).not.toContain('immutable');
  });
  it('serves font bytes rather than their base64 text', async () => {
    const path = '/fonts/Graphik-Regular-Web.woff2';
    const response = embeddedSiteResponse(new URL(path, 'https://seoresearcher.ai'), EMBEDDED_SITE)!;
    expect(Buffer.from(await response.arrayBuffer())).toEqual(readFileSync(`public${path}`));
    expect(response.headers.get('content-type')).toBe('font/woff2');
  });
  it('returns no asset for an unknown route', () => {
    expect(embeddedSiteResponse(new URL('https://seoresearcher.ai/help/missing'), EMBEDDED_SITE)).toBeNull();
  });
});
