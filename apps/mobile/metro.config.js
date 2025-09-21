const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');
const packageRoots = ['core', 'ui', 'api-client', 'workflows'].map(pkg =>
  path.resolve(monorepoRoot, 'packages', pkg)
);

const makeBlockList = patterns =>
  new RegExp(
    patterns
      .map(pattern =>
        pattern instanceof RegExp ? pattern.source : pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      )
      .join('|')
  );

const blockList = makeBlockList([
  /android[\\/]\.cxx[\\/]*/,
  /apps[\\/]mobile[\\/]build[\\/]*/,
]);

const extraNodeModules = new Proxy(
  {},
  { get: (_, name) => path.join(monorepoRoot, 'node_modules', name) }
);

const config = {
  projectRoot: __dirname,
  watchFolders: [monorepoRoot, ...packageRoots],
  resolver: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@ybis/core': path.resolve(monorepoRoot, 'packages/core/src'),
      '@ybis/ui': path.resolve(monorepoRoot, 'packages/ui/src'),
      '@ybis/api-client': path.resolve(monorepoRoot, 'packages/api-client/src'),
      '@ybis/workflows': path.resolve(monorepoRoot, 'packages/workflows/src'),
    },
    extraNodeModules,
    nodeModulesPaths: [path.resolve(monorepoRoot, 'node_modules')],
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
    blockList,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
