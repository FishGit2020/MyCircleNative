const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Configures the iOS Podfile for Firebase compatibility:
 * 1. Sets ios.useFrameworks to "static" in Podfile.properties.json
 *    (required for Firebase Swift pods like FirebaseAuth)
 * 2. Adds CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES
 *    to post_install (required for @react-native-firebase + React headers)
 */
module.exports = function withFirebaseIOSStaticFrameworks(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosDir = path.join(config.modRequest.projectRoot, 'ios');

      // 1. Update Podfile.properties.json
      const propsPath = path.join(iosDir, 'Podfile.properties.json');
      if (fs.existsSync(propsPath)) {
        const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));
        props['ios.useFrameworks'] = 'static';
        fs.writeFileSync(propsPath, JSON.stringify(props, null, 2) + '\n');
      }

      // 2. Patch Podfile to allow non-modular includes
      const podfilePath = path.join(iosDir, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, 'utf-8');

        const patchMarker = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES";
        if (!podfile.includes(patchMarker)) {
          const postInstallPatch = `
    # Allow non-modular includes for Firebase + React Native compatibility
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['${patchMarker}'] = 'YES'
      end
    end`;

          // Insert before the last `end` in post_install block
          const lastEndIndex = podfile.lastIndexOf('  end\nend');
          if (lastEndIndex !== -1) {
            podfile = podfile.slice(0, lastEndIndex) + postInstallPatch + '\n  end\nend\n';
          }
        }

        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};
