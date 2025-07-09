const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 144, 192, 512];
const iconsDir = path.join(__dirname, '../public/icons');

async function convertIcons() {
  try {
    for (const size of iconSizes) {
      const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

      if (fs.existsSync(svgPath)) {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`✓ Converted ${size}x${size} icon to PNG`);
      } else {
        console.error(`✗ SVG file not found: ${svgPath}`);
      }
    }
    console.log('\n✨ All icons converted successfully!');
  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

convertIcons();