import { ModalWrapper } from "@/src/components/modal-wrapper";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface PermissionModalProps {
  visible: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  onAllow: () => void;
  onDeny: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  icon,
  title,
  description,
  onAllow,
  onDeny,
}) => {
  return (
    <ModalWrapper
      visible={visible}
      onClose={onDeny}
      title={title}
      maxHeightPct={65}
      icon={
        <View className="relative">
          <View className="absolute inset-0 bg-primary-200/30 rounded-full scale-110" />
          <View className="p-6 rounded-full bg-primary-200/50">
            <MaterialIcons
              name={icon}
              size={40}
              color={COLORS.primary.DEFAULT}
            />
          </View>
        </View>
      }
      footer={
        <View className="gap-3">
          <Button title="Permitir Acesso" onPress={onAllow} />
          <Button variant="secondary" title="Agora não" onPress={onDeny} />
        </View>
      }
    >
      {/* DESCRIÇÃO */}
      <View className="mb-8">
        <Typography
          variant="body"
          tone="muted"
          className="text-center leading-6"
        >
          {description}
        </Typography>
      </View>
    </ModalWrapper>
  );
};
