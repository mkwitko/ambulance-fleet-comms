import { hideSplashScreen } from "@/src/config/splash-screen";
import { useCheckAuth } from "@/src/http/generated/auth/auth";
import { useGetAuthenticatedCommsUser } from "@/src/http/generated/comms/comms";
import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { data: checkAuth, isLoading: isLoadingCheckAuth } = useCheckAuth();
  const { isLoading: isLoadingUser } = useGetAuthenticatedCommsUser({
    query: {
      enabled: checkAuth?.isAuthenticated === true,
    },
  });
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (isLoadingCheckAuth || isLoadingUser) return;

    if (checkAuth?.isAuthenticated) {
      router.replace("/protected/app/permissions");

      hideSplashScreen();
      return;
    }

    router.replace("/public/sign-in");
    hideSplashScreen();
  }, [rootNavigationState?.key, isLoadingCheckAuth, isLoadingUser]);

  return null;
}
