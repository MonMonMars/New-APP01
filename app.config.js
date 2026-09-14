/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const baseUrl = process.env.EXPO_PUBLIC_BASE_PATH ?? '';

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins ?? []), 'expo-secure-store'],
    experiments: {
      baseUrl,
    },
  },
};
