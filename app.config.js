// app.config.js
export default ({ config }) => ({
  ...config,
  expo: {
    name: "Connect Comms",
    slug: "connect-commns",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "connectcomms",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    package: "com.connectapp.comms",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.connectapp.comms",
    },
    android: {
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.connectapp.comms",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-background-connection-plugin",
        {
          "notificationTitle": "Call Active",
          "notificationBody": "Your connection is active"
        }
      ],
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
      EXPO_PUBLIC_ABLY_API_KEY: process.env.EXPO_PUBLIC_ABLY_API_KEY,
      EXPO_PUBLIC_AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID,
    },
  },
});
