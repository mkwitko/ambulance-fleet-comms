import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { JSX, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetAuthenticatedCommsUser200 } from "../http/generated/api.schemas";
import { useSignOut } from "../http/generated/auth/auth";
import { queryClient } from "../lib/react-query";
import { COLORS } from "../styles/colors";
import { Button } from "./ui/button";
import { Typography } from "./ui/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

export default function SidebarModal({
  sidebarVisible,
  setSidebarVisible,
  user,
}: {
  sidebarVisible: boolean;
  setSidebarVisible: (value: boolean) => void;
  user: GetAuthenticatedCommsUser200 | undefined;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { mutateAsync: signOut } = useSignOut();

  const handleNavigate = (route: Href) => {
    closeSidebar();
    router.replace(route);
  };
  const handleLogout = async () => {
    closeSidebar();
    await signOut();
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    queryClient.invalidateQueries();
  };

  const closeSidebar = () => setSidebarVisible(false);

  const menuItems: Array<{
    section: string;
    items: Array<{
      icon: JSX.Element;
      label: string;
      route?: Href;
      onPress?: () => void;
    }>;
  }> = [
    {
      section: "Geral",
      items: [
        {
          icon: (
            <Ionicons
              name="chatbox-outline"
              size={20}
              color={COLORS.primary.DEFAULT}
            />
          ),
          label: "Intercomunicação",
          route: "/protected/app/chat",
        },
        {
          icon: (
            <MaterialIcons
              name="admin-panel-settings"
              size={20}
              color={COLORS.primary.DEFAULT}
            />
          ),
          label: "Permissões",
          route: "/protected/app/permissions",
        },
      ],
    },
  ];

  const isRouteActive = (route?: Href) => {
    if (!route) return false;
    return pathname === route;
  };

  useEffect(() => {
    if (sidebarVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sidebarVisible]);

  return (
    <Modal
      visible={sidebarVisible}
      transparent
      animationType="none"
      onRequestClose={closeSidebar}
    >
      <View className="flex-1 flex-row">
        {/* OVERLAY */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 bg-black/60"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSidebar}
            className="flex-1"
          />
        </Animated.View>

        {/* SIDEBAR */}
        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            width: SIDEBAR_WIDTH,
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
          }}
          className="bg-white"
        >
          <LinearGradient
            className="flex-1"
            colors={[
              "rgba(0,128,0,0.05)",
              "rgba(0,128,0,0.05)",
              "rgba(0,128,0,0.07)",
            ]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          >
            {/* SCROLLABLE CONTENT */}
            <SafeAreaView className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {/* USER PROFILE */}
                <View className="bg-primary px-6 py-8">
                  <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                      <Typography
                        variant="title"
                        weight="bold"
                        className="text-primary"
                      >
                        {user?.data.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </Typography>
                    </View>
                    <View className="flex-1 gap-1">
                      <Typography
                        variant="title"
                        weight="bold"
                        className="text-white"
                      >
                        {user?.data.name}
                      </Typography>
                      <Typography variant="small" className="text-white/80">
                        {user?.data.mail}
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* AMBULANCE STATUS CARD */}
                <View className="p-4 border-b border-input">
                  <View className="rounded-xl p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <Typography variant="small" weight="semibold">
                        Informações do Veículo
                      </Typography>
                    </View>
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons
                        name="local-shipping"
                        size={20}
                        color={COLORS.mutedForeground}
                      />
                      <Typography variant="body" weight="bold">
                        {user?.data.base.name}
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* MENU ITEMS */}
                <View className="py-2">
                  {menuItems.map((section, sectionIndex) => (
                    <View key={sectionIndex} className="mb-2">
                      <View className="px-6 py-2">
                        <Typography
                          variant="extraSmall"
                          weight="semibold"
                          tone="muted"
                        >
                          {section.section}
                        </Typography>
                      </View>
                      {section.items.map((item, itemIndex) => {
                        const isActive = isRouteActive(item.route);
                        return (
                          <TouchableOpacity
                            key={itemIndex}
                            onPress={() => {
                              if (item.route) {
                                handleNavigate(item.route);
                                return;
                              }
                              if (item.onPress) {
                                item.onPress();
                              }
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center gap-3 px-6 py-3 ${
                              isActive ? "bg-primary/10" : ""
                            }`}
                          >
                            <View
                              className={`w-12 h-12 rounded-xl items-center justify-center ${
                                isActive ? "bg-primary" : "bg-primary-100/50"
                              }`}
                            >
                              {React.cloneElement(item.icon, {
                                color: isActive
                                  ? "white"
                                  : COLORS.primary.DEFAULT,
                              })}
                            </View>
                            <Typography
                              variant="caption"
                              weight={isActive ? "bold" : "semibold"}
                              className={isActive ? "text-primary" : ""}
                            >
                              {item.label}
                            </Typography>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>

            {/* FIXED FOOTER */}
            <View className="border-t border-gray-200 bg-white">
              <View className="px-6 py-4 gap-4">
                <Button
                  variant="destructive"
                  onPress={handleLogout}
                  title="Sair da Conta"
                />
              </View>

              {/* VERSION */}
              <View className="px-6 pb-4 items-center">
                <Typography variant="extraSmall" tone="muted">
                  Versão 1.0.0
                </Typography>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
