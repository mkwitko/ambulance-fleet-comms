import { AppGuardStatus } from "../@types/app-guard";
import { NavigationRoute } from "../@types/navigation";

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    route: "/protected/app/permissions",
    label: "Permissões",
    icon: "admin-panel-settings",
    description: "Gerencie as permissões necessárias",
    status: AppGuardStatus.MISSING_PERMISSIONS,
  },
];
