import { MaterialIcons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppGuardStatus, AppGuardStatusType } from "../@types/app-guard";
import { NAVIGATION_ROUTES } from "../data/blocked-navigation-data";
import { useSignOut } from "../http/generated/auth/auth";
import { queryClient } from "../lib/react-query";
import { COLORS } from "../styles/colors";
import {
  AppPermissionType,
  PERMISSION_LABELS,
} from "../utils/check-permissions";
import { ModalWrapper } from "./modal-wrapper";
import { Button } from "./ui/button";
import { Typography } from "./ui/typography";

export default function BlockedNavigationModal({
  showBlockedModal,
  setShowBlockedModal,
  statuses,
  missingPermissions,
  retryPermissions,
}: {
  showBlockedModal: boolean;
  setShowBlockedModal: (value: boolean) => void;
  statuses: AppGuardStatusType[];
  missingPermissions: AppPermissionType[];
  retryPermissions: () => Promise<void>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNavigationOptions, setShowNavigationOptions] = useState(false);

  const { mutateAsync: signOut } = useSignOut();

  const handleLogout = async () => {
    await signOut();
    queryClient.invalidateQueries();
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  };

  const availableRoutes = NAVIGATION_ROUTES.filter(
    (item) =>
      pathname !== item.route && item.status && statuses.includes(item.status),
  );

  // Determinar o problema específico
  const isMissingPermissions =
    statuses?.includes(AppGuardStatus.MISSING_PERMISSIONS) &&
    missingPermissions.length > 0;

  const handleNavigate = (route: Href) => {
    setShowNavigationOptions(false);
    setShowBlockedModal(false);
    router.push(route);
  };

  const handleMainAction = () => {
    if (availableRoutes.length === 0) {
      setShowBlockedModal(false);
    } else {
      setShowNavigationOptions(true);
    }
  };

  // Tela de navegação
  if (showNavigationOptions) {
    return (
      <ModalWrapper
        visible={showBlockedModal}
        persistent={true}
        onClose={() => setShowNavigationOptions(false)}
        icon={
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <MaterialIcons
                name="navigation"
                size={32}
                color={COLORS.primary.DEFAULT}
              />
            </View>
            <Typography
              variant="title"
              weight="bold"
              className="text-center mb-2"
            >
              Para onde deseja ir?
            </Typography>
          </View>
        }
        footer={
          <Button
            onPress={() => setShowNavigationOptions(false)}
            title="Voltar"
            variant="ghost"
          />
        }
      >
        <View className="bg-white w-full">
          <View className="gap-3">
            <Typography variant="caption" align="center" tone="muted">
              Selecione uma das opções abaixo para resolver o bloqueio:
            </Typography>

            <View className="gap-4 mt-4">
              {availableRoutes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <View className="items-center border border-input bg-white/70 p-5 rounded-xl">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                      <MaterialIcons
                        name={item.icon}
                        size={26}
                        color={COLORS.primary.DEFAULT}
                      />
                    </View>
                    <Typography
                      variant="body"
                      weight="bold"
                      align="center"
                      className="mb-2"
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="caption" tone="muted" align="center">
                      {item.description}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ModalWrapper>
    );
  }

  // Tela principal com problema específico
  return (
    <ModalWrapper
      visible={showBlockedModal}
      onClose={() => setShowBlockedModal(false)}
      persistent={true}
      icon={
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
            <MaterialIcons name="block" size={28} color={COLORS.destructive} />
          </View>
          <Typography variant="title" weight="bold" className="text-center">
            Navegação Bloqueada
          </Typography>
        </View>
      }
      footer={
        <Button
          onPress={handleMainAction}
          title={availableRoutes.length === 0 ? "Entendi" : "Resolver Agora"}
        />
      }
    >
      <View className="bg-white w-full">
        <View className="gap-3">
          <Typography variant="body" align="center" tone="muted">
            O acesso ao menu está bloqueado devido ao seguinte problema:
          </Typography>

          <View className="gap-4 mt-4">
            {/* Problema de Permissões */}
            {isMissingPermissions && (
              <View className="items-center border border-input bg-white/70 p-5 rounded-xl">
                <View className="w-12 h-12 rounded-full bg-destructive/10 items-center justify-center mb-3">
                  <MaterialIcons
                    name="lock"
                    size={24}
                    color={COLORS.destructive}
                  />
                </View>
                <Typography
                  variant="body"
                  weight="bold"
                  align="center"
                  className="mb-3"
                >
                  Permissões necessárias
                </Typography>
                <Typography
                  variant="caption"
                  tone="muted"
                  align="center"
                  className="mb-4"
                >
                  As seguintes permissões precisam ser liberadas:
                </Typography>

                {/* Lista de permissões faltantes */}
                <View className="w-full gap-3">
                  {missingPermissions.map((permission, index) => {
                    const permInfo = PERMISSION_LABELS[permission];
                    return (
                      <View
                        key={index}
                        className="bg-white/70 p-4 rounded-xl border border-input"
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                            <MaterialIcons
                              name={permInfo.icon}
                              size={20}
                              color={COLORS.primary.DEFAULT}
                            />
                          </View>
                          <View className="flex-1">
                            <Typography
                              variant="body"
                              weight="semibold"
                              className="mb-1"
                            >
                              {permInfo.label}
                            </Typography>
                            <Typography variant="caption" tone="muted">
                              {permInfo.description}
                            </Typography>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Caso genérico (não deveria acontecer, mas por segurança) */}
            {!isMissingPermissions && (
              <View className="items-center bg-muted p-5 rounded-2xl">
                <View className="w-12 h-12 rounded-full bg-background items-center justify-center mb-3">
                  <MaterialIcons
                    name="error-outline"
                    size={24}
                    color={COLORS.mutedForeground}
                  />
                </View>
                <Typography
                  variant="body"
                  weight="semibold"
                  align="center"
                  className="mb-1"
                >
                  Problema desconhecido
                </Typography>
                <Typography variant="caption" tone="muted" align="center">
                  Verifique as configurações do app ou entre em contato com o
                  suporte.
                </Typography>
              </View>
            )}
          </View>

          {/* Seção de Ações Alternativas */}
          <View className="mt-6">
            <Typography
              variant="caption"
              tone="muted"
              align="center"
              className="mb-4"
            >
              Outras opções disponíveis:
            </Typography>

            <View className="gap-3">
              {/* Sair da Conta */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  handleLogout();
                }}
              >
                <View className="flex-row items-center gap-3 p-4 rounded-xl border border-destructive/10 bg-destructive/5">
                  <View className="w-10 h-10 rounded-full bg-destructive/5 items-center justify-center">
                    <MaterialIcons
                      name="logout"
                      size={20}
                      color={COLORS.destructive}
                    />
                  </View>
                  <View className="flex-1">
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-destructive"
                    >
                      Sair da Conta
                    </Typography>
                    <Typography variant="caption" tone="muted">
                      Desconectar do aplicativo
                    </Typography>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.destructive}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
}
