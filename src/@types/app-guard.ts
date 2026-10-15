// -------------------------------------
// AppGuardStatus
// -------------------------------------
export const AppGuardStatus = {
  OK: "ok",
  MISSING_PERMISSIONS: "missing-permissions",
} as const;

export type AppGuardStatusType =
  (typeof AppGuardStatus)[keyof typeof AppGuardStatus];
