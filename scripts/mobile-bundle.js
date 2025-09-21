#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Renkli çıktı için ANSI kodları
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(50)}`, 'cyan');
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Build parametreleri
const buildConfig = {
  platform: 'android',
  dev: false,
  entryFile: 'index.js',
  bundleOutput: 'android/app/src/main/assets/index.android.bundle',
  nodeOptions: '--max-old-space-size=8192'
};

function checkPrerequisites() {
  logSection('PREREQUISITES CHECK');
  
  // Node.js versiyonu kontrolü
  try {
    const nodeVersion = process.version;
    logStep('1', `Node.js version: ${nodeVersion}`);
    
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 20) {
      logWarning(`Node.js ${majorVersion} detected. Recommended: Node.js 20+`);
    } else {
      logSuccess(`Node.js version is compatible`);
    }
  } catch (error) {
    logError('Failed to check Node.js version');
  }

  // React Native CLI kontrolü
  try {
    execSync('npx react-native --version', { stdio: 'pipe' });
    logStep('2', 'React Native CLI: Available');
    logSuccess('React Native CLI is installed');
  } catch (error) {
    logError('React Native CLI not found. Run: npm install -g @react-native-community/cli');
    process.exit(1);
  }

  // Bundle output dizini kontrolü
  const bundleDir = path.dirname(buildConfig.bundleOutput);
  if (!fs.existsSync(bundleDir)) {
    logStep('3', `Creating bundle directory: ${bundleDir}`);
    fs.mkdirSync(bundleDir, { recursive: true });
    logSuccess('Bundle directory created');
  } else {
    logStep('3', `Bundle directory exists: ${bundleDir}`);
    logSuccess('Bundle directory is ready');
  }
}

function showBuildInfo() {
  logSection('BUILD CONFIGURATION');
  
  logStep('Platform', buildConfig.platform);
  logStep('Mode', buildConfig.dev ? 'Development' : 'Production');
  logStep('Entry File', buildConfig.entryFile);
  logStep('Output', buildConfig.bundleOutput);
  logStep('Node Options', buildConfig.nodeOptions);
  
  // Bundle dosyası varsa boyutunu göster
  const bundlePath = buildConfig.bundleOutput;
  if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    const lastModified = stats.mtime.toLocaleString();
    logStep('Previous Bundle', `${sizeInMB} MB (${lastModified})`);
  } else {
    logStep('Previous Bundle', 'Not found');
  }
}

function runBundle() {
  logSection('RUNNING BUNDLE');
  
  const command = `cross-env NODE_OPTIONS=${buildConfig.nodeOptions} react-native bundle --platform ${buildConfig.platform} --dev ${buildConfig.dev} --entry-file ${buildConfig.entryFile} --bundle-output ${buildConfig.bundleOutput} --verbose`;
  
  logStep('Command', command);
  logStep('Status', 'Starting bundle process...');
  
  const startTime = Date.now();
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', 'apps', 'mobile')
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    logSuccess(`Bundle completed successfully in ${duration}s`);
    
    // Bundle dosyası bilgilerini göster
    if (fs.existsSync(buildConfig.bundleOutput)) {
      const stats = fs.statSync(buildConfig.bundleOutput);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      logStep('Bundle Size', `${sizeInMB} MB`);
      logStep('Location', buildConfig.bundleOutput);
    }
    
  } catch (error) {
    logError('Bundle process failed');
    logError(error.message);
    process.exit(1);
  }
}

function showNextSteps() {
  logSection('NEXT STEPS');
  
  logStep('1', 'Run Android build: npm run build:android');
  logStep('2', 'Or use Nx: nx run mobile:android');
  logStep('3', 'Check bundle: ls -la android/app/src/main/assets/');
  
  log('\n💡 Tips:', 'cyan');
  log('• Use --skip-nx-cache to force rebuild', 'yellow');
  log('• Check gradle.properties for caching settings', 'yellow');
  log('• Monitor bundle size for performance', 'yellow');
}

// Ana fonksiyon
function main() {
  log('🚀 YBIS Mobile Bundle Builder', 'bright');
  log('================================', 'cyan');
  
  try {
    checkPrerequisites();
    showBuildInfo();
    runBundle();
    showNextSteps();
    
    log('\n🎉 Build process completed successfully!', 'green');
    
  } catch (error) {
    logError('Build process failed');
    logError(error.message);
    process.exit(1);
  }
}

// Script çalıştırıldığında ana fonksiyonu çağır
if (require.main === module) {
  main();
}

module.exports = { main };




