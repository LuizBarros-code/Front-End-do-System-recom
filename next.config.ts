/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Permitir imagens do backend local e do servidor de produção
      {
        protocol: "http",
        hostname: "localhost",
        port: "3456",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "26.99.103.209",
        port: "3456",
        pathname: "/uploads/**",
      },
    ],
  },
}

module.exports = nextConfig

