const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');
const sharedPackages = [
  { name: '@ybis/core', dir: 'core' },
  { name: '@ybis/ui', dir: 'ui' },
  { name: '@ybis/api-client', dir: 'api-client' },
  { name: '@ybis/workflows', dir: 'workflows' },
];

const packageDistRoots = sharedPackages.map(pkg =>
  path.resolve(monorepoRoot, 'packages', pkg.dir, 'dist')
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
  watchFolders: [monorepoRoot, ...packageDistRoots],
  resolver: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      nanoid: require.resolve('nanoid/non-secure/index.cjs'),
      ...sharedPackages.reduce((aliases, pkg) => {
        aliases[pkg.name] = path.resolve(monorepoRoot, 'packages', pkg.dir, 'dist');
        return aliases;
      }, {}),
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
