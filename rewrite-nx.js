const fs = require('fs');
const path = 'nx.json';
const config = {
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "npmScope": "ybis",
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "packages"
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/.eslintrc.json"
    ],
    "sharedGlobals": [
      "{workspaceRoot}/package.json",
      "{workspaceRoot}/tsconfig.base.json"
    ]
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "type-check"],
        "parallel": 3
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "dependsOn": ["^build"],
