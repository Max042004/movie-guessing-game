/** next.config.js */
const repo = 'movie-guessing-game'
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : undefined,
}
