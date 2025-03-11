/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Configuration for example.com
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      // Configuration for Google Drive URLs (uc?export=view)
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/uc**", // Covers any path that starts with /uc
      },
      // Configuration for API
      {
        protocol: process.env.NODE_ENV === "development" ? "http" : "https",
        hostname: process.env.NODE_ENV === "development" ? "localhost" : "**",
        port: process.env.NODE_ENV === "development" ? "3456" : "",
      },
    ],
  },
}

module.exports = nextConfig

