import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function useAnimationHook({
  modalVisible,
}: {
  modalVisible: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  const animateEntrance = () => {
    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        })
      )
    ).start();
  };

  const animateProgress = (toValue: number) => {
    Animated.spring(progressAnim, {
      toValue: toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [modalVisible]);

  const returnObject = {
    animateEntrance,
    animateProgress,
    scaleAnim,
    fadeAnim,
    cardAnims,
    progressAnim,
  } as const; // <- 🔥 mantém os tipos estáveis, inferidos e imutáveis

  return returnObject;
}

export type UseAnimationHookReturn = ReturnType<typeof useAnimationHook>;
