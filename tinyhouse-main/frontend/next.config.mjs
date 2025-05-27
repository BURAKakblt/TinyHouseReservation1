// next.config.mjs
export default {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader", "postcss-loader"],
    });
    return config;
  },
};
