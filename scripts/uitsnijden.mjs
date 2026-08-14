/**
 * Snijdt een 3D-render los van zijn effen teal achtergrond en schrijft hem
 * als WebP met alfa naar public/.
 *
 *   node scripts/uitsnijden.mjs <bronbestand> <naam> [drempel]
 *   node scripts/uitsnijden.mjs ~/Downloads/hf_123.png hero-contact 12
 *
 * De vulling start op de rand, dus alles wat door het onderwerp omsloten
 * wordt blijft gespaard, ook als het toevallig dezelfde kleur heeft als de
 * achtergrond. Daarna houden we alleen de grootste samenhangende vorm over;
 * losse elementen zoals een logobadge in de hoek vallen zo vanzelf weg.
 *
 * De drempel is krap gekozen omdat de sokkel qua kleur dicht bij de
 * achtergrond ligt. Zit er te veel achtergrond in het resultaat, verhoog
 * hem; vreet hij aan de sokkel, verlaag hem.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const [bron, naam, drempelArg] = process.argv.slice(2);
if (!bron || !naam) {
  console.error('gebruik: node scripts/uitsnijden.mjs <bronbestand> <naam> [drempel]');
  process.exit(1);
}
const TOL = Number(drempelArg ?? 12);
const wortel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doel = path.join(wortel, 'public', `${naam}.webp`);

// Op werkhoogte verkleinen: scheelt geheugen en de vulling wordt er niet slechter van.
const { data, info } = await sharp(bron).resize({ height: 1900 }).removeAlpha()
  .raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;

// Achtergrondkleur schatten uit de bovenrand.
let r0 = 0, g0 = 0, b0 = 0, n = 0;
for (let x = 0; x < W; x += 3) { const i = x * 3; r0 += data[i]; g0 += data[i+1]; b0 += data[i+2]; n++; }
r0 /= n; g0 /= n; b0 /= n;

const bijAchtergrond = (i) =>
  Math.abs(data[i*3] - r0) < TOL &&
  Math.abs(data[i*3+1] - g0) < TOL &&
  Math.abs(data[i*3+2] - b0) < TOL;

// Vullen vanaf de vier randen.
const achter = new Uint8Array(W * H);
const stapel = [];
for (let x = 0; x < W; x++) stapel.push(x, (H-1) * W + x);
for (let y = 0; y < H; y++) stapel.push(y * W, y * W + W - 1);
while (stapel.length) {
  const i = stapel.pop();
  if (achter[i] || !bijAchtergrond(i)) continue;
  achter[i] = 1;
  const x = i % W, y = (i / W) | 0;
  if (x > 0)     stapel.push(i - 1);
  if (x < W - 1) stapel.push(i + 1);
  if (y > 0)     stapel.push(i - W);
  if (y < H - 1) stapel.push(i + W);
}

// Alleen de grootste vorm houden.
const merk = new Int32Array(W * H).fill(-1);
let grootste = -1, grootsteN = 0, id = 0;
for (let s = 0; s < W * H; s++) {
  if (achter[s] || merk[s] >= 0) continue;
  let c = 0; const rij = [s]; merk[s] = id;
  while (rij.length) {
    const i = rij.pop(); c++;
    const x = i % W, y = (i / W) | 0;
    for (const j of [x > 0 ? i-1 : -1, x < W-1 ? i+1 : -1, y > 0 ? i-W : -1, y < H-1 ? i+W : -1])
      if (j >= 0 && !achter[j] && merk[j] < 0) { merk[j] = id; rij.push(j); }
  }
  if (c > grootsteN) { grootsteN = c; grootste = id; }
  id++;
}

const masker = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) masker[i] = merk[i] === grootste ? 255 : 0;

// Randje verzachten. b-w forceren, anders komt dit als drie kanalen terug.
const zacht = await sharp(masker, { raw: { width: W, height: H, channels: 1 } })
  .blur(0.9).linear(2.6, -200).toColourspace('b-w').raw().toBuffer();

const uit = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  uit[i*4] = data[i*3]; uit[i*4+1] = data[i*3+1]; uit[i*4+2] = data[i*3+2];
  uit[i*4+3] = zacht[i];
}

await sharp(uit, { raw: { width: W, height: H, channels: 4 } })
  .trim({ threshold: 1 })
  .resize({ height: 1340 })
  .webp({ quality: 84, alphaQuality: 92 })
  .toFile(doel);

const m = await sharp(doel).metadata();
const kb = (await sharp(doel).toBuffer()).length / 1024;
console.log(`${naam}.webp  ${m.width}x${m.height}  ${kb.toFixed(0)} KB`);
console.log(`achtergrond rgb ${[r0,g0,b0].map(Math.round).join(',')}  drempel ${TOL}  vormen ${id}  grootste ${(100*grootsteN/(W*H)).toFixed(1)}%`);
