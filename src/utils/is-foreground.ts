import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppIsForeground() {
  const [isForeground, setIsForeground] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        console.log("AppState changed to:", state);
        setIsForeground(state === "active");
      }
    );

    return () => subscription.remove();
  }, []);

  return isForeground;
}
