import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "HoldOff",
  slug: "holdoff",
  version: "1.0.7",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "holdoff",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#150E22",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.holdoff.app",
  },
  android: {
    package: "com.holdoff.app",
    versionCode: 7,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#150E22",
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "651afbd7-7513-4bcd-9dd8-2a77337befd6",
    },
  },
};

export default config;
