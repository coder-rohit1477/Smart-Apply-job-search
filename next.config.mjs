/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude canvas from server-side bundle (used by pdfjs-dist optionally)
      config.externals = [...(config.externals || []), { canvas: "canvas" }];
    }

    // Handle pdfjs-dist and unpdf properly
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
  // Increase server action body size limit for resume uploads (5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
