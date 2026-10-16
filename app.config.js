// app.config.js
export default ({ config }) => ({
  ...config,
  expo: {
    name: "Ambulance Fleet Comms",
    slug: "ambulance-fleet-comms",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ambulancefleetcomms",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    package: "com.ambulancefleet.comms",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ambulancefleet.comms",
    },
    android: {
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.ambulancefleet.comms",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "sounds": [
						'./assets/sounds/notification_aero.mp3',
					],
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF",
        },
      ],
      ["expo-secure-store"],
      ["expo-font"],
      ["expo-audio"],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // Environment variables exposed through expo-constants
      EXPO_PUBLIC_BACKEND: process.env.EXPO_PUBLIC_BACKEND,
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION,
      EXPO_PUBLIC_AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID,
    },
  },
});
