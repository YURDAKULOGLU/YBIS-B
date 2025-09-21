#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const cliBin = path.resolve(
  projectRoot,
  'node_modules',
  '@react-native-community',
  'cli',
  'build',
  'bin.js'
);

const args = process.argv.slice(2);
const cwd = process.cwd();

const pathOptions = new Set([
  '--config',
  '--entry-file',
  '--bundle-output',
  '--assets-dest',
  '--projectRoot',
  '--root',
  '--watchFolders',
]);

const normalisedArgs = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg.startsWith('--')) {
    const [flag, value] = arg.split('=');

    if (value !== undefined) {
      if (pathOptions.has(flag)) {
        normalisedArgs.push(`${flag}=${path.resolve(cwd, value)}`);
      } else {
        normalisedArgs.push(arg);
      }
      continue;
    }

    normalisedArgs.push(flag);

    if (pathOptions.has(flag) && i + 1 < args.length) {
      normalisedArgs.push(path.resolve(cwd, args[i + 1]));
      i += 1;
      continue;
    }

    continue;
  }

  normalisedArgs.push(arg);
}

const nodePath = [path.resolve(projectRoot, 'node_modules'), process.env.NODE_PATH]
  .filter(Boolean)
  .join(path.delimiter);

const result = spawnSync(process.execPath, [cliBin, ...normalisedArgs], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, NODE_PATH: nodePath },
});

process.exit(result.status === null ? 1 : result.status);
