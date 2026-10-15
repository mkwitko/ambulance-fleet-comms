import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

// -------------------------------------
// AppPermission (enum-like com const)
// -------------------------------------
export const AppPermission = {
  NOTIFICATIONS: "notifications",
  FOREGROUND_SERVICE: "foregroundService",
  WAKE_LOCK: "wakeLock",
} as const;

// Deriva o tipo automaticamente
export type AppPermissionType =
  (typeof AppPermission)[keyof typeof AppPermission];

// -------------------------------------
// Função de checagem
// -------------------------------------
export const checkAllPermissions = async (): Promise<{
  ok: boolean;
  missing: AppPermissionType[];
}> => {
  const notifications = await Notifications.getPermissionsAsync();

  const missing: AppPermissionType[] = [];

  if (!notifications.granted) missing.push(AppPermission.NOTIFICATIONS);

  return {
    ok: missing.length === 0,
    missing,
  };
};

export const PERMISSION_LABELS: Record<
  AppPermissionType,
  {
    label: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  [AppPermission.NOTIFICATIONS]: {
    label: "Notificações",
    description: "Necessária para enviar notificações importantes",
    icon: "notifications",
  },
  [AppPermission.FOREGROUND_SERVICE]: {
    label: "Serviço em Primeiro Plano",
    description:
      "Necessária para manter chamadas de voz ativas quando o app está minimizado",
    icon: "notifications-active",
  },
  [AppPermission.WAKE_LOCK]: {
    label: "Wake Lock",
    description:
      "Mantém o processamento ativo durante chamadas de voz em segundo plano",
    icon: "lock",
  },
};
