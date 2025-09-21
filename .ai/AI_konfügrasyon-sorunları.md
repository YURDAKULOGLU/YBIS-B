
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');
const packageRoots = ['core', 'ui', 'api-client', 'workflows'].map(pkg =>
path.resolve(monorepoRoot, 'packages', pkg)
);

const config = {
projectRoot: __dirname,
watchFolders: packageRoots,
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
extraNodeModules: {
'react-native-gesture-handler': path.resolve(monorepoRoot, 'node_modules/react-native-gesture-handler'),
'react-native-screens': path.resolve(monorepoRoot, 'node_modules/react-native-screens'),
'react-native-safe-area-context': path.resolve(monorepoRoot, 'node_modules/react-native-safe-area-context'),
},
nodeModulesPaths: [path.resolve(monorepoRoot, 'node_modules')],
unstable_enablePackageExports: true,
unstable_enableSymlinks: true,
blockList: exclusionList([
/android.cxx./,
/apps\mobile\build./,
]),
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

### RN Giriş Dosyası Şablonu
/**

@format
*/
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

enableScreens();

AppRegistry.registerComponent(appName, () => App);
### Uygulama Adımları
- Metro cache reset: `npm start -- --reset-cache`
- Android: `cd apps/mobile && npx react-native run-android`
- iOS: `cd apps/mobile && npx react-native run-ios`
- Yeni RN uygulaması açarken bu iki dosyayı template olarak kopyala.

### Kontrol Listesi
- [ ] Metro config şablonu uygulandı mı?
- [ ] `extraNodeModules` referansları kök `node_modules`'a işaret ediyor mu?
- [ ] Giriş dosyası `enableScreens()` içeriyor mu?
- [ ] Metro cache reset edildi mi?
- [ ] Android/iOS build komutları sorunsuz çalıştı mı?
