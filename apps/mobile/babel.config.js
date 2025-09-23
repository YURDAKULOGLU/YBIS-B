module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
        regenerator: false,
        useESModules: false,
        absoluteRuntime: false,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};

