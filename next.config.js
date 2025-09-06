/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // allow Farcaster to load your app
          },
        ],
      },
    ];
  },

  images: {
    domains: ["api.sportsdata.io", "media.api-sports.io", "www.thesportsdb.com"],
  },
};

module.exports = nextConfig;
