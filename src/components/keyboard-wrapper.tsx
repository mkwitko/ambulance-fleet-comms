import React from "react";
import {
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ViewProps,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface KeyboardWrapperProps extends ViewProps {
  children: React.ReactNode;
  keyboardOffset?: number;
}

/**
 * KeyboardWrapper - Envolve o conteúdo e faz scroll automático
 * quando o teclado aparece (ideal para formulários).
 */
export function KeyboardWrapper({
  children,
  keyboardOffset = 0,
  className,
}: KeyboardWrapperProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={[{ flex: 1 }]}
        className={className}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        extraScrollHeight={
          keyboardOffset || (Platform.OS === "android" ? 80 : 0)
        }
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
