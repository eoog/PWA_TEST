// next.config.js
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true // base64 이미지를 위해 필요할 수 있음
  },
  typescript: {
    // !! WARN !!
    // 프로덕션 환경에서는 권장되지 않습니다!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;