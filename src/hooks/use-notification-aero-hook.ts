import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useEffect } from "react";

const audioSource = require("./../../assets/sounds/notification_aero.mp3");

export default function useNotificationAeroHook() {
  const player = useAudioPlayer(audioSource);

  const setupAudio = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionModeAndroid: "duckOthers",
      interruptionMode: "duckOthers",
    });

    player.volume = 1.0;
  };

  // Volume máximo
  useEffect(() => {
    setupAudio();
  }, []);

  const playSound = async () => {
    await player.seekTo(0);
    player.play();
  };

  const stopSound = async () => {
    player.pause();
    await player.seekTo(0);
  };

  return {
    playSound,
    stopSound,
  };
}
