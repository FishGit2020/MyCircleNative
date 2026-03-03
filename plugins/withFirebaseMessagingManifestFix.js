const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Fixes AndroidManifest merge conflict between expo-notifications and
 * @react-native-firebase/messaging — both set the
 * com.google.firebase.messaging.default_notification_color meta-data.
 *
 * Adds tools:replace="android:resource" to the conflicting meta-data element
 * and ensures the tools namespace is declared on the manifest root.
 */
module.exports = function withFirebaseMessagingManifestFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure tools namespace is declared
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const application = manifest.application?.[0];
    if (!application) return config;

    const metaData = application['meta-data'] || [];
    for (const meta of metaData) {
      if (
        meta.$?.['android:name'] ===
        'com.google.firebase.messaging.default_notification_color'
      ) {
        meta.$['tools:replace'] = 'android:resource';
      }
    }

    return config;
  });
};
