// Gera os ícones do PWA (192, 512, 512 maskable) a partir de um SVG simples
// com o troféu (mesmo path MDI usado no header) sobre fundo azul-marinho do tema.
// Uso: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

const TROPHY_PATH =
  'M18 2C17.1 2 16 3 16 4H8C8 3 6.9 2 6 2H2V11C2 12 3 13 4 13H6.2C6.6 15 7.9 16.7 11 17V19.08C8 19.54 8 22 8 22H16C16 22 16 19.54 13 19.08V17C16.1 16.7 17.4 15 17.8 13H20C21 13 22 12 22 11V2H18M6 11H4V4H6V11M20 11H18V4H20V11Z'

const NAVY_DARK = '#0b2545'
const NAVY = '#1d4e89'

/**
 * Ícone "normal": fundo com cantos arredondados + troféu centralizado,
 * ocupando boa parte do canvas (ok para favicon/ícone comum, não precisa
 * respeitar a "safe zone" de maskable icons).
 */
function regularSvg(size) {
  const r = size * 0.22
  const scale = (size * 0.56) / 24
  const offset = (size - 24 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${TROPHY_PATH}" fill="#ffffff"/>
  </g>
</svg>`
}

/**
 * Ícone "maskable": fundo preenche o canvas inteiro (sem cantos arredondados
 * próprios — o SO aplica sua própria máscara) e o troféu fica confinado
 * dentro da safe zone central (~80% do menor lado) para não ser cortado.
 */
function maskableSvg(size) {
  const scale = (size * 0.42) / 24
  const offset = (size - 24 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${TROPHY_PATH}" fill="#ffffff"/>
  </g>
</svg>`
}

const jobs = [
  { name: 'pwa-192.png', svg: regularSvg(192) },
  { name: 'pwa-512.png', svg: regularSvg(512) },
  { name: 'pwa-maskable-512.png', svg: maskableSvg(512) },
  { name: 'apple-touch-icon.png', svg: regularSvg(180) },
]

for (const job of jobs) {
  const out = join(publicDir, job.name)
  await sharp(Buffer.from(job.svg)).png().toFile(out)
  console.log('wrote', out)
}

// Favicon novo (mesmo visual, para coerência de marca) — mantém o antigo
// favicon.svg de lado, apenas adiciona um .ico simples de 32x32 e 64x64.
writeFileSync(join(publicDir, 'icon.svg'), regularSvg(64))
console.log('wrote', join(publicDir, 'icon.svg'))
