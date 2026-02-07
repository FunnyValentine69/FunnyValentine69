const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FPS = 20;
const DURATION = 8; // seconds
const TOTAL_FRAMES = FPS * DURATION; // 160
const WIDTH = 800;
const HEIGHT = 560;

async function capture() {
  const framesDir = path.join(__dirname, 'frames');
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true });
  }
  fs.mkdirSync(framesDir);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION}s)...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [`--window-size=${WIDTH},${HEIGHT}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  const htmlPath = 'file://' + path.join(__dirname, 'intro.html');
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded' });

  // Small delay to ensure canvas is ready
  await new Promise(r => setTimeout(r, 200));

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = (i / TOTAL_FRAMES) * DURATION;

    // Call our deterministic render function with exact time
    await page.evaluate((time) => window.renderFrame(time), t);

    const frameNum = String(i).padStart(4, '0');
    await page.screenshot({
      path: path.join(framesDir, `frame_${frameNum}.png`),
      type: 'png'
    });

    if ((i + 1) % 20 === 0) {
      console.log(`  ${i + 1}/${TOTAL_FRAMES} frames captured`);
    }
  }

  await browser.close();
  console.log('Capture complete.');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
