/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

// Specify the path to your request configuration file
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  images: {
    domains: [
      "via.placeholder.com",
      "source.unsplash.com",
      "picsum.photos",
      "i.pravatar.cc",
      "placehold.co",
    ],
  },
};

module.exports = nextConfig;
export default withNextIntl(nextConfig);
