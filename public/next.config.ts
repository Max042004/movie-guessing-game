/** @type {import('next').NextConfig} */
const repo = 'movie-guessing-game'        // 取代成 GitHub 專案名稱
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  output: 'export',                  // 啟用靜態匯出（舊指令 next export 已被移除）
  distDir: 'out',                    // 產物目錄
  trailingSlash: true,               // 把 /about 變 /about/index.html
  images: { unoptimized: true },     // GitHub Pages 無 Image Optimizer
  basePath: isProd ? `/${repo}` : '',// 讓連結、圖片路徑對得起子目錄
  assetPrefix: isProd ? `/${repo}/` : undefined,
}
