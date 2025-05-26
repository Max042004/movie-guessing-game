/** next.config.ts */
const repo = 'movie-guessing-game'
const isProd = process.env.NODE_ENV === 'production'

export default {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : undefined,
}


