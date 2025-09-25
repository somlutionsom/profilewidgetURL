const fs = require('fs');
const path = require('path');

// 간단한 SVG 기반 OG 이미지 생성
const svgContent = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE3ED;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFD0D8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFC1DA;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Main Container -->
  <rect x="200" y="90" width="800" height="450" rx="24" fill="white" stroke="#FFD0D8" stroke-width="4"/>
  
  <!-- Avatar Circle -->
  <circle cx="600" cy="200" r="60" fill="#FFD0D8" stroke="white" stroke-width="6"/>
  <text x="600" y="210" text-anchor="middle" font-size="48" fill="white">♡⸝⸝</text>
  
  <!-- Title -->
  <text x="600" y="320" text-anchor="middle" font-size="48" font-weight="bold" fill="#484747" font-family="system-ui, sans-serif">Profile Widget</text>
  
  <!-- Subtitle -->
  <text x="600" y="360" text-anchor="middle" font-size="24" fill="#8E8E93" font-family="system-ui, sans-serif">나만의 프로필 위젯을 만들어보세요</text>
  
  <!-- Features -->
  <g transform="translate(400, 400)">
    <!-- Color Feature -->
    <rect x="0" y="0" width="60" height="60" rx="12" fill="#FFC1DA"/>
    <text x="30" y="40" text-anchor="middle" font-size="24">🎨</text>
    <text x="30" y="80" text-anchor="middle" font-size="16" fill="#484747" font-family="system-ui, sans-serif">색상</text>
    
    <!-- Text Feature -->
    <rect x="120" y="0" width="60" height="60" rx="12" fill="#9EC6F3"/>
    <text x="150" y="40" text-anchor="middle" font-size="24">📝</text>
    <text x="150" y="80" text-anchor="middle" font-size="16" fill="#484747" font-family="system-ui, sans-serif">문구</text>
    
    <!-- Image Feature -->
    <rect x="240" y="0" width="60" height="60" rx="12" fill="#E4EFE7"/>
    <text x="270" y="40" text-anchor="middle" font-size="24">🖼️</text>
    <text x="270" y="80" text-anchor="middle" font-size="16" fill="#484747" font-family="system-ui, sans-serif">이미지</text>
  </g>
  
  <!-- CTA Button -->
  <rect x="500" y="500" width="200" height="50" rx="12" fill="#FFD0D8"/>
  <text x="600" y="530" text-anchor="middle" font-size="20" font-weight="600" fill="white" font-family="system-ui, sans-serif">지금 시작하기 →</text>
  
  <!-- Decorative Elements -->
  <circle cx="1000" cy="150" r="40" fill="#FFC1DA" opacity="0.3"/>
  <circle cx="150" cy="480" r="30" fill="#9EC6F3" opacity="0.3"/>
  <circle cx="100" cy="300" r="20" fill="#E4EFE7" opacity="0.4"/>
</svg>
`;

// SVG 파일로 저장
const svgPath = path.join(__dirname, '../public/og-image.svg');
fs.writeFileSync(svgPath, svgContent);

console.log('OG 이미지 SVG가 생성되었습니다: public/og-image.svg');
console.log('이 파일을 PNG로 변환하려면 온라인 도구나 ImageMagick을 사용하세요.');
