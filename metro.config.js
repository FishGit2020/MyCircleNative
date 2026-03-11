const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch all packages in the monorepo
config.watchFolders = [workspaceRoot];

// Resolve packages from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Ensure symlinked packages resolve correctly
config.resolver.disableHierarchicalLookup = false;

// Auto-resolve @mycircle/* packages from packages/ directory
// so new packages work without manual config changes
const packagesDir = path.resolve(projectRoot, 'packages');
const extraNodeModules = {};
if (fs.existsSync(packagesDir)) {
  for (const dir of fs.readdirSync(packagesDir)) {
    const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkgJson.name) {
        extraNodeModules[pkgJson.name] = path.join(packagesDir, dir);
      }
    }
  }
}
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...extraNodeModules,
};

module.exports = withNativeWind(config, { input: './global.css' });
