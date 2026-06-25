import sharp from 'sharp';
import fs from 'fs';

const svgPath = './public/theta-icon.svg';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('./public/pwa-192x192.png');

  // Generate 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('./public/pwa-512x512.png');

  // Generate apple-touch-icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('./public/apple-touch-icon.png');
    
  console.log('Icons generated successfully.');
}

generateIcons().catch(console.error);
