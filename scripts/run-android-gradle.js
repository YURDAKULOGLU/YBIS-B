#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const androidDir = path.resolve(process.cwd(), 'android');
const isWindows = process.platform === 'win32';
const executable = isWindows ? 'gradlew.bat' : './gradlew';

const result = spawnSync(executable, process.argv.slice(2), {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) {
  const message = result.error.code === 'ENOENT'
    ? `Could not find ${executable} in ${androidDir}`
    : result.error.message;
  console.error(`Failed to run Android Gradle wrapper: ${message}`);
  process.exit(result.status ?? 1);
}

if (result.status !== null) {
  process.exit(result.status);
}

if (result.signal) {
  console.error(`Gradle wrapper exited due to signal: ${result.signal}`);
  process.exit(1);
}

process.exit(0);
