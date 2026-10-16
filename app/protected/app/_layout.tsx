// src/app/app-layout.tsx
import AppGuard from "@/src/guards/app-guard";
import { useRadioCallHandler } from "@/src/hooks/use-radio-call-handler";
import { Slot } from "expo-router";
import { useState } from "react";

export default function AppLayout() {
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useRadioCallHandler();

  return (
    <AppGuard
      showBlockedModal={showBlockedModal}
      setShowBlockedModal={setShowBlockedModal}
    >
      <Slot />
    </AppGuard>
  );
}
