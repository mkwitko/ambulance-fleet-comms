// src/hooks/useBackgroundService.ts
import BackgroundConnection from "expo-background-connection-plugin";
import { useEffect } from "react";

export function useBackgroundService({ enabled }: { enabled: boolean }) {
  const startService = async () => {
    try {
      const isRunning = await BackgroundConnection.isServiceRunning();
      console.log("Background connection is running:", isRunning);

      if (!isRunning) {
        const result = await BackgroundConnection.startService({
          notificationTitle: "Connect Comms",
          notificationBody: "Aplicativo rodando em segundo plano",
          keepMicrophoneActive: false,
        });

        console.log("Background connection started:", result);
      }
    } catch (err) {
      console.error("Error starting background connection:", err);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    let isUnmounted = false;

    startService();

    return () => {
      if (!isUnmounted) {
        BackgroundConnection.stopService();
      }
      isUnmounted = true;
    };
  }, [enabled]);
}
