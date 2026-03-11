const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Remove the aps-environment (Push Notifications) entitlement.
 * Uses withDangerousMod to run AFTER all other plugins have written
 * the entitlements file, ensuring the push entitlement is stripped.
 */
module.exports = function withRemovePushEntitlement(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const entitlementsPath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        `${config.modRequest.projectName}.entitlements`
      );

      if (fs.existsSync(entitlementsPath)) {
        let content = fs.readFileSync(entitlementsPath, 'utf8');
        // Remove aps-environment key-value pair
        content = content.replace(
          /\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>/g,
          ''
        );
        fs.writeFileSync(entitlementsPath, content);
      }

      return config;
    },
  ]);
};
