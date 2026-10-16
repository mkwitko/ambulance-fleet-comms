import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  Image,
  Keyboard,
  Platform,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import KeyboardSpacer from "@/src/components/keyboard-spacer";
import { Button } from "@/src/components/ui/button";
import { FormField } from "@/src/components/ui/form-field";
import { Input } from "@/src/components/ui/input";
import { SecureInput } from "@/src/components/ui/secure-input";
import { Typography } from "@/src/components/ui/typography";
import { useSignInComms } from "@/src/http/generated/auth/auth";
import { useRouter } from "expo-router";

const signInSchema = z.object({
  mail: z
    .string()
    .min(1, "E-mail é obrigatório")
    .refine((val) => val.includes("@"), { message: "E-mail inválido" }),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { mutateAsync: signIn } = useSignInComms();
  const passwordRef = useRef<TextInput>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { mail: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    await signIn({
      data: {
        mail: data.mail,
        password: data.password,
      },
    });
    router.replace("/protected/app/permissions");
  };

  // --------------------------------------
  // 🔥 ANIMAÇÕES DA LOGO
  // --------------------------------------
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvent, () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const subHide = Keyboard.addListener(hideEvent, () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center px-4">
      <Animated.View
        style={{
          transform: [{ translateY }, { scale }],
        }}
      >
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={{ width: 220, height: 110 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 🔥 CARD DO FORM */}
      <View className="w-full bg-white p-6 gap-4 rounded-xl border border-input mt-10">
        <View className="gap-1 mb-2">
          <Typography variant="title" align="center">
            Gestão de Ambulâncias
          </Typography>
          <Typography variant="subtitle" align="center">
            Acesse sua conta com CPF
          </Typography>
        </View>

        <View className="w-full">
          <FormField control={control} name="mail" error={errors.mail}>
            {({ value, onChange, onBlur }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Insira seu E-mail"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                variant={errors.mail ? "error" : "default"}
              />
            )}
          </FormField>

          <FormField control={control} name="password" error={errors.password}>
            {({ value, onChange, onBlur }) => (
              <SecureInput
                ref={passwordRef}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Senha"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                variant={errors.password ? "error" : "default"}
                keyboardType="numeric"
              />
            )}
          </FormField>
        </View>

        <Button
          title={isSubmitting ? "Entrando..." : "Entrar"}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          className="mt-2"
        />

        <Typography variant="small" align="center" className="mt-4">
          © {new Date().getFullYear()} — Ambulance Fleet - Gestão de Ambulâncias
        </Typography>
      </View>

      <KeyboardSpacer />
    </View>
  );
}
