import { Typography } from "@/src/components/ui/typography";
import { useGetAuthenticatedCommsUser } from "@/src/http/generated/comms/comms";
import { useCreateRadioIntercomms } from "@/src/http/generated/radio/radio";
import { useAgora } from "@/src/services/use-agora";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ConnectionStateType } from "react-native-agora";

export enum ConnectionStateString {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  FAILED = "FAILED",
}

export default function Chat() {
  const { data: user } = useGetAuthenticatedCommsUser();
  const { mutateAsync: createRadioMeeting } = useCreateRadioIntercomms();
  const { join, leave, connectionState } = useAgora();

  const connectionInfo = useMemo(() => {
    switch (String(connectionState)) {
      case String(ConnectionStateType.ConnectionStateDisconnected):
        return {
          text: "Desconectado",
          badge: "Offline",
          icon: "radio-button-unchecked" as const,
          bgColor: "bg-gray-200/50",
          badgeBg: "bg-gray-100",
          badgeText: "text-gray-700",
          dotColor: "bg-gray-500",
          iconColor: COLORS.mutedForeground,
        };

      case String(ConnectionStateType.ConnectionStateConnecting):
        return {
          text: "Estabelecendo conexão...",
          badge: "Conectando",
          icon: "sync" as const,
          bgColor: "bg-yellow-200/50",
          badgeBg: "bg-yellow-100",
          badgeText: "text-yellow-700",
          dotColor: "bg-yellow-500",
          iconColor: COLORS.warning,
        };

      case String(ConnectionStateType.ConnectionStateConnected):
        return {
          text: "Conexão estabelecida",
          badge: "Online",
          icon: "radio-button-checked" as const,
          bgColor: "bg-primary-200/50",
          badgeBg: "bg-primary-100",
          badgeText: "text-primary-700",
          dotColor: "bg-primary-500",
          iconColor: COLORS.primary.DEFAULT,
        };

      case String(ConnectionStateType.ConnectionStateReconnecting):
        return {
          text: "Recuperando conexão...",
          badge: "Reconectando",
          icon: "refresh" as const,
          bgColor: "bg-blue-200/50",
          badgeBg: "bg-blue-100",
          badgeText: "text-blue-700",
          dotColor: "bg-blue-500",
          iconColor: COLORS.info,
        };

      case String(ConnectionStateType.ConnectionStateFailed):
        return {
          text: "Não foi possível conectar",
          badge: "Falhou",
          icon: "error-outline" as const,
          bgColor: "bg-red-200/50",
          badgeBg: "bg-red-100",
          badgeText: "text-red-700",
          dotColor: "bg-red-500",
          iconColor: COLORS.destructive,
        };

      default:
        return {
          text: "Status desconhecido",
          badge: "Indefinido",
          icon: "help-outline" as const,
          bgColor: "bg-gray-200/50",
          badgeBg: "bg-gray-100",
          badgeText: "text-gray-700",
          dotColor: "bg-gray-500",
          iconColor: COLORS.mutedForeground,
        };
    }
  }, [connectionState]);

  const handleCall = async (channelName: string, baseId: string) => {
    const response = await createRadioMeeting({
      data: { id: channelName, baseId },
    });

    await join({
      token: response.rtcToken,
      channel: response.id,
      uid: response.uid as string,
    });
  };

  const isConnected =
    connectionState === String(ConnectionStateType.ConnectionStateConnected);
  const isDisconnected =
    connectionState === String(ConnectionStateType.ConnectionStateDisconnected);

  useEffect(() => {
    console.log("Connection State:", connectionState);
  }, [connectionState]);

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
              Connect Comms
            </Typography>
            <Typography variant="subtitle">
              Sistema de comunicação em tempo real
            </Typography>
          </View>

          {/* STATUS CARD PREMIUM */}
          <View className="bg-primary rounded-xl p-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="gap-1">
                <Typography variant="small" className="text-primary-100">
                  Status da Conexão
                </Typography>
                <Typography
                  variant="title"
                  weight="bold"
                  className="text-white"
                >
                  {connectionInfo.text}
                </Typography>
              </View>
              <View className={`p-4 rounded-2xl ${connectionInfo.bgColor}`}>
                <MaterialIcons
                  name={connectionInfo.icon}
                  size={32}
                  color={connectionInfo.iconColor[500]}
                />
              </View>
            </View>

            {/* STATUS BADGE */}
            <View className="flex-row items-center justify-between">
              <View
                className={`flex-row items-center gap-1.5 ${connectionInfo.badgeBg} px-3 py-2 rounded-full`}
              >
                <View
                  className={`w-2 h-2 rounded-full ${connectionInfo.dotColor}`}
                />
                <Typography
                  variant="extraSmall"
                  className={connectionInfo.badgeText}
                >
                  {connectionInfo.badge}
                </Typography>
              </View>

              {isConnected && (
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <Typography variant="extraSmall" className="text-white">
                    Ativo
                  </Typography>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* USER INFO CARD */}
        {user?.data && (
          <View className="mx-6 mb-4">
            <View className="bg-connect p-6">
              <View className="flex-row items-start gap-4">
                <View className="p-4 rounded-xl bg-primary-200/50">
                  <MaterialIcons
                    name="person"
                    size={28}
                    color={COLORS.primary.DEFAULT}
                  />
                </View>

                <View className="flex-1">
                  <Typography variant="caption" weight="semibold">
                    Informações do Usuário
                  </Typography>

                  <View className="mt-3 gap-2">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="badge"
                        size={16}
                        color={COLORS.mutedForeground}
                      />
                      <Typography variant="small" tone="muted">
                        Nome: {user.data.name}
                      </Typography>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="location-on"
                        size={16}
                        color={COLORS.mutedForeground}
                      />
                      <Typography variant="small" tone="muted">
                        Base: {user.data.base.name}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ACTIONS SECTION */}
        <View className="px-6 gap-4">
          <Typography variant="caption" weight="semibold" className="mb-2">
            Ações Disponíveis
          </Typography>

          {/* BOTÃO ENTRAR */}
          {/* <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              handleCall(user?.data.id as string, user?.data.base.id as string);
            }}
            disabled={isConnected || !user?.data}
            className={`bg-connect p-6 ${
              isConnected || !user?.data ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row items-start gap-4">
              <View
                className={`p-4 rounded-xl ${
                  isConnected || !user?.data
                    ? "bg-gray-200/50"
                    : "bg-primary-200/50"
                }`}
              >
                <MaterialIcons
                  name="phone-in-talk"
                  size={28}
                  color={
                    isConnected || !user?.data
                      ? COLORS.mutedForeground
                      : COLORS.primary.DEFAULT
                  }
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Typography variant="caption" weight="semibold">
                    Entrar no Canal
                  </Typography>
                  {!isConnected && user?.data && (
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={COLORS.mutedForeground}
                    />
                  )}
                </View>

                <Typography variant="small" tone="muted">
                  Conectar ao canal de rádio da sua base
                </Typography>

                {(isConnected || !user?.data) && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="info-outline"
                        size={14}
                        color={COLORS.mutedForeground}
                      />
                      <Typography
                        variant="extraSmall"
                        className="text-muted-foreground flex-1"
                      >
                        {isConnected
                          ? "Você já está conectado ao canal"
                          : "Carregando informações do usuário..."}
                      </Typography>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity> */}

          {/* BOTÃO SAIR */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={leave}
            disabled={isDisconnected}
            className={`bg-connect p-6 ${isDisconnected ? "opacity-50" : ""}`}
          >
            <View className="flex-row items-start gap-4">
              <View
                className={`p-4 rounded-xl ${
                  isDisconnected ? "bg-gray-200/50" : "bg-red-200/50"
                }`}
              >
                <MaterialIcons
                  name="call-end"
                  size={28}
                  color={
                    isDisconnected ? COLORS.mutedForeground : COLORS.destructive
                  }
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Typography variant="caption" weight="semibold">
                    Sair do Canal
                  </Typography>
                  {!isDisconnected && (
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={COLORS.mutedForeground}
                    />
                  )}
                </View>

                <Typography variant="small" tone="muted">
                  Desconectar do canal de rádio
                </Typography>

                {isDisconnected && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="info-outline"
                        size={14}
                        color={COLORS.mutedForeground}
                      />
                      <Typography
                        variant="extraSmall"
                        className="text-muted-foreground flex-1"
                      >
                        Você não está conectado a nenhum canal
                      </Typography>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
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
                Mantenha uma conexão de internet estável para garantir a melhor
                qualidade de áudio durante a comunicação
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
