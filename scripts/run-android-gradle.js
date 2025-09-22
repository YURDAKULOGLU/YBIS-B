#!/usr/bin/env node
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const path = require('node:path');
const https = require('node:https');
const { pipeline } = require('node:stream');
const { promisify } = require('node:util');

const streamPipeline = promisify(pipeline);

const projectDir = path.resolve(__dirname, '../apps/mobile/android');
const wrapperDir = path.join(projectDir, 'gradle/wrapper');
const wrapperJarPath = path.join(wrapperDir, 'gradle-wrapper.jar');
const wrapperPropertiesPath = path.join(wrapperDir, 'gradle-wrapper.properties');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const args = process.argv.slice(2);

const ensureWrapperJar = async () => {
  try {
    await fs.promises.access(wrapperJarPath, fs.constants.F_OK);
    return;
  } catch (_) {
    // continue with download flow
  }

  let properties;
  try {
    properties = await fs.promises.readFile(wrapperPropertiesPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read Gradle wrapper properties at ${wrapperPropertiesPath}: ${error.message}`);
  }

  const distributionLine = properties
    .split(/\r?\n/)
    .find((line) => line.startsWith('distributionUrl='));

  if (!distributionLine) {
    throw new Error('Unable to determine Gradle distribution URL from gradle-wrapper.properties');
  }

  const distributionUrl = distributionLine
    .slice('distributionUrl='.length)
    .replace(/\\:/g, ':');

  const { origin, pathname } = new URL(distributionUrl);
  const match = pathname.match(/gradle-([^/]+)-(bin|all)\.zip$/);

  if (!match) {
    throw new Error(`Unsupported Gradle distribution URL format: ${distributionUrl}`);
  }

  const version = match[1];
  const wrapperUrl = `${origin}/gradle-${version}-wrapper.jar`;

  await fs.promises.mkdir(wrapperDir, { recursive: true });

  await new Promise((resolve, reject) => {
    https
      .get(wrapperUrl, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`Failed to download Gradle wrapper jar from ${wrapperUrl}: HTTP ${response.statusCode}`));
          response.resume();
          return;
        }

        streamPipeline(response, fs.createWriteStream(wrapperJarPath))
          .then(resolve)
          .catch((error) => {
            reject(new Error(`Failed to save Gradle wrapper jar: ${error.message}`));
          });
      })
      .on('error', (error) => {
        reject(new Error(`Failed to request Gradle wrapper jar: ${error.message}`));
      });
  });
};

const runGradle = () =>
  new Promise((resolve, reject) => {
    const child = spawn(gradleExecutable, args, {
      cwd: projectDir,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start Gradle wrapper: ${error.message}`));
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Gradle wrapper terminated with signal ${signal}`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`Gradle wrapper exited with status ${code}`));
        return;
      }

      resolve();
    });
  });

(async () => {
  try {
    await ensureWrapperJar();
    await runGradle();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
})();
