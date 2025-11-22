// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Enables static HTML export (Required for GitHub Pages)
  output: 'export',
  
  // 2. Sets the sub-path to match your GitHub Repository name
  basePath: '/autocollimator-lab',
  
  // 3. Ensures assets (CSS/JS) load from the correct path
  assetPrefix: '/autocollimator-lab/', 
  
  // 4. Output directory
  distDir: 'out',
  
  // 5. Adds trailing slashes (e.g., /about/ instead of /about) - good for static hosting
  trailingSlash: true,
  
  // 6. Disable image optimization (Next.js Image component doesn't work with 'export' by default)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;