/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  //output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
    domains: ["media.istockphoto.com"],
  },
  experimental: {
    typedRoutes: false,
  },
  webpack: (config, { dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
      "fs/promises": false,
      child_process: false,
      worker_threads: false,
      v8: false,
      "util/types": false,
      async_hooks: false,
      console: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      http2: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
      dns: false,
      critters: false,
      "stream/web": false,
      perf_hooks: false,
      diagnostics_channel: false,
    };
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(server-only|node:.*|\.\/server.*)$/,
      })
    );

    // Отключаем минификацию для отладки
    //if (process.env.NODE_ENV === "development") {
    config.optimization.minimize = false;
    //}
    return config;
  },
};

export default nextConfig;
