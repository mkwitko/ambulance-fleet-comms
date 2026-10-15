import { MaterialIcons } from "@expo/vector-icons";
import { Href } from "expo-router";
import { AppGuardStatusType } from "./app-guard";

export type NavigationRoute = {
  route: Href;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
  status: AppGuardStatusType;
};
