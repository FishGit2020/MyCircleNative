const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Remove the aps-environment (Push Notifications) entitlement.
 * Personal Apple dev teams don't support push, so this prevents
 * signing failures on local dev builds.
 */
module.exports = function withRemovePushEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
};
