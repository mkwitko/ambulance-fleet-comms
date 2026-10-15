import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

interface PermissionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  granted: boolean;
  canAskAgain: boolean;
  onPress: () => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  icon,
  title,
  description,
  granted,
  canAskAgain,
  onPress,
}) => {
  return (
    <Animated.View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={granted || !canAskAgain}
        className="bg-connect p-6"
      >
        <View className="flex-row items-start gap-4">
          {/* ÍCONE COM EFEITO GLASSMORPHISM */}
          <View
            className={`p-4 rounded-xl ${
              granted
                ? "bg-primary-200/50"
                : !canAskAgain
                ? "bg-red-200/50"
                : "bg-gray-200/50"
            }`}
          >
            <MaterialIcons
              name={icon}
              size={28}
              color={
                granted
                  ? COLORS.primary.DEFAULT
                  : !canAskAgain
                  ? COLORS.destructive
                  : COLORS.mutedForeground
              }
            />
          </View>

          {/* CONTEÚDO */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Typography variant="caption" weight="semibold">
                {title}
              </Typography>

              {/* STATUS BADGE */}
              {granted ? (
                <View className="flex-row items-center gap-1.5 bg-primary-100 px-3 py-2 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-primary-500" />
                  <Typography variant="extraSmall" className="text-primary-700">
                    Ativa
                  </Typography>
                </View>
              ) : !canAskAgain ? (
                <View className="flex-row items-center gap-1.5 bg-red-100 px-3 py-2 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-red-500" />
                  <Typography variant="extraSmall" className="text-red-700">
                    Negada
                  </Typography>
                </View>
              ) : (
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={COLORS.mutedForeground}
                />
              )}
            </View>

            <Typography variant="small" tone="muted">
              {description}
            </Typography>

            {/* ALERTA BLOQUEIO */}
            {!granted && !canAskAgain && (
              <View className="mt-4 pt-4 border-t border-red-50">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons
                    name="settings"
                    size={14}
                    color={COLORS.destructive}
                  />
                  <Typography
                    variant="extraSmall"
                    className="text-red-600 flex-1"
                  >
                    Ative nas configurações do sistema
                  </Typography>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
