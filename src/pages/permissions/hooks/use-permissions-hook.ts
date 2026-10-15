import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { UseAnimationHookReturn } from "./use-animation-hook";

interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

interface PermissionsState {
  notifications: PermissionStatus;
}

export type PermissionType = keyof PermissionsState;

export default function usePermissionsHook({
  animationState,
  setModalVisible,
  setPermissionsCompleted,
  retryPermissions,
}: {
  animationState?: UseAnimationHookReturn;
  setModalVisible: (visible: boolean) => void;
  setPermissionsCompleted?: (completed: boolean) => void;
  retryPermissions: () => Promise<void>;
}) {
  const { animateProgress, animateEntrance, cardAnims } = animationState || {};

  const [permissions, setPermissions] = useState<PermissionsState>({
    notifications: { granted: false, canAskAgain: true },
  });

  const [currentPermission, setCurrentPermission] =
    useState<PermissionType | null>(null);

  const permissionDetails = {
    notifications: {
      icon: "notifications" as const,
      title: "Notificações",
      description: "Para avisar sobre eventos importantes no app.",
    },
  };

  const activeCount = Object.values(permissions).filter(
    (p) => p.granted,
  ).length;

  const totalCount = Object.keys(permissionDetails).length; // agora 5
  const progressPercentage = (activeCount / totalCount) * 100;

  const currentDetail = currentPermission
    ? permissionDetails[currentPermission]
    : null;

  const permissionTypes = Object.keys(permissionDetails) as PermissionType[];

  // -----------------------------
  // CHECK ALL PERMISSIONS
  // -----------------------------
  const checkAllPermissions = async (): Promise<void> => {
    const notifications = await Notifications.getPermissionsAsync();

    setPermissions({
      notifications: {
        granted: notifications.granted,
        canAskAgain: notifications.canAskAgain ?? true,
      },
    });
    retryPermissions();
  };

  // -----------------------------
  // REQUEST PERMISSION
  // -----------------------------
  const requestPermission = async (type: PermissionType): Promise<void> => {
    switch (type) {
      case "notifications":
        await Notifications.requestPermissionsAsync();
        break;
    }

    setModalVisible(false);
    await checkAllPermissions();

    setTimeout(() => {
      cardAnims?.forEach((anim) => anim.setValue(0));
      animateEntrance && animateEntrance();
    }, 100);
  };

  const openModal = (type: PermissionType): void => {
    setCurrentPermission(type);
    setModalVisible(true);
  };

  // -----------------------------
  // UPDATE PROGRESS
  // -----------------------------
  useEffect(() => {
    if (!animateProgress) return;

    const activeCount = Object.values(permissions).filter(
      (p) => p.granted,
    ).length;

    const progress = activeCount / totalCount;
    animateProgress(progress);

    setPermissionsCompleted &&
      setPermissionsCompleted(activeCount === totalCount);
  }, [permissions]);

  // -----------------------------
  // INIT
  // -----------------------------
  useEffect(() => {
    checkAllPermissions();
    animateEntrance && animateEntrance();
  }, []);

  return {
    activeCount,
    totalCount,
    progressPercentage,
    permissionTypes,
    openModal,
    currentDetail,
    permissionDetails,
    permissions,
    currentPermission,
    requestPermission,
  };
}
