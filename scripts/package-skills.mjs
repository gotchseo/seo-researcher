import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Deterministic, uncompressed ZIPs: a single inspectable SKILL.md per download.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zipSkill(name, body) {
  const path = Buffer.from(`${name}/SKILL.md`);
  const crc = crc32(body);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
  local.writeUInt16LE(33, 12); // 1980-01-01; deterministic timestamp.
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(body.length, 18); local.writeUInt32LE(body.length, 22); local.writeUInt16LE(path.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(33, 14);
  central.writeUInt32LE(crc, 16); central.writeUInt32LE(body.length, 20); central.writeUInt32LE(body.length, 24); central.writeUInt16LE(path.length, 28);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10); end.writeUInt32LE(central.length + path.length, 12); end.writeUInt32LE(local.length + path.length + body.length, 16);
  return Buffer.concat([local, path, body, central, path, end]);
}
await mkdir('public/downloads', { recursive: true });
const manifest = [];
for (const name of (await readdir('skills')).sort()) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Invalid skill directory: ${name}`);
  const body = await readFile(`skills/${name}/SKILL.md`);
  if (!body.toString().startsWith(`---\nname: ${name}\n`)) throw new Error(`Skill name mismatch: ${name}`);
  const zip = zipSkill(name, body);
  await writeFile(`public/downloads/${name}.zip`, zip);
  await writeFile(`public/downloads/${name}.md`, body);
  manifest.push({ name, version: '1.0.0', url: `/downloads/${name}.zip`, sha256: createHash('sha256').update(zip).digest('hex'), bytes: zip.length });
}
await writeFile('public/downloads/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Packaged ${manifest.length} skills.`);
