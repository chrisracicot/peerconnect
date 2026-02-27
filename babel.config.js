module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          alias: {
            "@": "./",
            "@components": "./components",
            "@screens": "./app/screens",
            "@tabs": "./app/(tabs)",
            "@context": "./app/context",
            "@constants": "./constants",
            "@models": "./types",
            "@lib": "./lib",
          },
        },
      ],
      "react-native-reanimated/plugin",
      "@babel/plugin-syntax-import-meta",
    ],
  };
};
