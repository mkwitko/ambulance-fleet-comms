import { Typography } from "@/src/components/ui/typography";
import { useAppGuard } from "@/src/guards/use-app-guard";
import { PermissionCard } from "@/src/pages/permissions/components/permission-card";
import { PermissionModal } from "@/src/pages/permissions/components/permission-modal";
import useAnimationHook from "@/src/pages/permissions/hooks/use-animation-hook";
import usePermissionsHook from "@/src/pages/permissions/hooks/use-permissions-hook";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";

export default function Permissions() {
  const { retryPermissions } = useAppGuard();
  const [modalVisible, setModalVisible] = useState(false);

  const animationState = useAnimationHook({
    modalVisible,
  });
  const { progressAnim } = animationState;

  const {
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
  } = usePermissionsHook({
    animationState,
    setModalVisible,
    retryPermissions,
  });

  const SCREEN_WIDTH = Dimensions.get("window").width;

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-32"
      >
        {/* HEADER PREMIUM */}
        <View className="p-6">
          <View className="gap-2">
            <Typography variant="title" weight="semibold">
              Permissões
            </Typography>
            <Typography variant="subtitle">
              Configure os acessos necessários para o funcionamento do app
            </Typography>
          </View>

          {/* PROGRESS CARD */}
          <View className="bg-primary rounded-xl p-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="gap-1">
                <Typography variant="small" className="text-primary-100">
                  Progresso Geral
                </Typography>
                <Typography
                  variant="title"
                  weight="bold"
                  className="text-white"
                >
                  {activeCount} de {totalCount}
                </Typography>
              </View>

              <View className="p-4 rounded-2xl bg-white/20">
                <Typography
                  variant="title"
                  weight="bold"
                  className="text-white"
                >
                  {progressPercentage.toFixed(0)}%
                </Typography>
              </View>
            </View>

            {/* BARRA ANIMADA */}
            <View className="h-3 bg-white/20 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-white rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH],
                  }),
                }}
              />
            </View>
          </View>
        </View>

        {/* LISTA DE PERMISSÕES */}
        <View className="px-6 gap-4">
          {permissionTypes.map((type) => (
            <PermissionCard
              key={type}
              icon={permissionDetails[type].icon}
              title={permissionDetails[type].title}
              description={permissionDetails[type].description}
              granted={permissions[type].granted}
              canAskAgain={permissions[type].canAskAgain}
              onPress={() => openModal(type)}
            />
          ))}
        </View>

        {/* INFO FOOTER */}
        <View className="mx-6 mt-4 bg-blue-50 rounded-2xl p-5">
          <View className="flex-row gap-3">
            <View className="pt-0.5">
              <MaterialIcons
                name="info-outline"
                size={20}
                color={COLORS.primary.DEFAULT}
              />
            </View>
            <View className="flex-1">
              <Typography variant="small" className="text-blue-900 leading-5">
                Você pode alterar estas permissões a qualquer momento nas
                configurações do seu dispositivo
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL */}
      {currentDetail && (
        <PermissionModal
          visible={modalVisible}
          icon={currentDetail.icon}
          title={currentDetail.title}
          description={currentDetail.description}
          onAllow={() =>
            currentPermission && requestPermission(currentPermission)
          }
          onDeny={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}
