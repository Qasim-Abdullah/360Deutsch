import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });

    // Force a single Three.js instance for bare "three" imports on the client.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "three$": path.resolve(__dirname, "node_modules/three/build/three.module.js"),
      };
    }

    // Fix for @splinetool/react-spline exports resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@splinetool/react-spline/next": path.resolve(
        __dirname,
        "node_modules/@splinetool/react-spline/dist/react-spline-next.js"
      ),
    };

    return config;
  },
};

export default nextConfig;
