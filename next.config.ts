/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 💥 Skippar ESLint-fel vid deploy
  },
}

export default nextConfig
