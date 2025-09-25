const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // HTML 파일 경로
  const htmlPath = path.join(__dirname, '../public/og-image.html');
  const fileUrl = `file://${htmlPath}`;
  
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  // 1200x630 크기로 스크린샷 촬영
  await page.setViewport({ width: 1200, height: 630 });
  
  // PNG 파일로 저장
  await page.screenshot({
    path: path.join(__dirname, '../public/og-image.png'),
    type: 'png',
    fullPage: false
  });
  
  await browser.close();
  console.log('OG 이미지가 생성되었습니다: public/og-image.png');
}

generateOGImage().catch(console.error);
