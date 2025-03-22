import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
