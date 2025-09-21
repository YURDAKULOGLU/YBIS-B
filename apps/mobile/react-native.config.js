module.exports = {
  project: {
    android: {
      sourceDir: './android',
    },
  },
  assets: ['./src/assets/fonts'],
  dependencies: {
    '@shopify/flash-list': {
      platforms: {
        android: null,
      },
    },
  },
};
