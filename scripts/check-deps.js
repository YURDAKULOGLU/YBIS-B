#!/usr/bin/env node
// Dependency version checker - prevents version conflicts
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const rootDir = process.cwd();
const rootPackagePath = path.join(rootDir, 'package.json');

if (!fs.existsSync(rootPackagePath)) {
  console.error('Root package.json not found.');
  process.exit(1);
}

const rootPkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));

function collectVersions(section) {
  return Object.entries(section || {}).reduce((acc, [name, value]) => {
    if (typeof value === 'string') {
      acc[name] = value;
    }
    return acc;
  }, {});
}

const policyOverrides = collectVersions(rootPkg.dependencyVersionPolicy);

const rootVersionMap = Object.keys(policyOverrides).length > 0
  ? policyOverrides
  : {
      ...collectVersions(rootPkg.dependencies),
      ...collectVersions(rootPkg.devDependencies),
      ...collectVersions(rootPkg.peerDependencies),
      ...collectVersions(rootPkg.optionalDependencies),
      ...collectVersions(rootPkg.overrides),
      ...collectVersions(rootPkg.resolutions),
    };

const trackedDeps = Object.keys(rootVersionMap);

if (trackedDeps.length === 0) {
  console.log('No root dependencies to verify.');
  process.exit(0);
}

function listWorkspacePackages() {
  const workspaces = Array.isArray(rootPkg.workspaces)
    ? rootPkg.workspaces
    : (rootPkg.workspaces && rootPkg.workspaces.packages) || [];

  const results = new Set();

  workspaces.forEach(pattern => {
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2);
      const basePath = path.join(rootDir, base);
      if (!fs.existsSync(basePath)) return;
      fs.readdirSync(basePath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .forEach(entry => results.add(path.join(base, entry.name)));
    } else {
      const full = path.join(rootDir, pattern);
      if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
        results.add(pattern);
      }
    }
  });

  return Array.from(results);
}

function rangesMatch(expected, actual) {
  const options = { includePrerelease: true };
  const expectedRange = semver.validRange(expected, options);
  const actualRange = semver.validRange(actual, options);

  if (expectedRange && actualRange) {
    return (
      semver.subset(actual, expected, options) &&
      semver.subset(expected, actual, options)
    );
  }

  return expected === actual;
}

function checkPackage(directory) {
  const pkgPath = path.join(rootDir, directory, 'package.json');
  if (!fs.existsSync(pkgPath)) return [];

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {}),
  };

  return trackedDeps.reduce((issues, name) => {
    const expected = rootVersionMap[name];
    const actual = deps[name];
    if (!actual) return issues;

    if (!rangesMatch(expected, actual)) {
      issues.push({ name, expected, actual });
    }

    return issues;
  }, []);
}

let hasIssue = false;
const workspaces = listWorkspacePackages();

workspaces.forEach(dir => {
  const issues = checkPackage(dir);
  if (issues.length === 0) {
    console.log(`[PASS] ${dir}`);
    return;
  }

  hasIssue = true;
  issues.forEach(({ name, expected, actual }) => {
    console.error(`[FAIL] ${dir} -> ${name}: ${actual} (expected ${expected})`);
  });
});

if (hasIssue) {
  process.exit(1);
}

console.log('All workspace dependencies match root versions.');
