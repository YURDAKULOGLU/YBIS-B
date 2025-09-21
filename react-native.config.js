const { bundleCommand, startCommand } = require('@react-native/community-cli-plugin');

module.exports = {
  project: {
    android: {
      sourceDir: './apps/mobile/android',
      appName: 'YBISMobile',
      packageName: 'com.ybismobile',
    },
    ios: {
      sourceDir: './apps/mobile/ios',
    },
  },
  commands: [bundleCommand, startCommand],
};
