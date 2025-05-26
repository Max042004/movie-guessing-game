// next.config.js
const repo  = 'movie-guessing-game'
const prodOnPages = process.env.DEPLOY_TARGET === 'github-pages'

module.exports = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath:   prodOnPages ? `/${repo}` : '',
  assetPrefix: prodOnPages ? `/${repo}/` : undefined,
}
