// components/AnimatedCard.js
import React, { useRef, useEffect } from "react";
import { Animated, View } from "react-native";

export default function AnimatedCard({ children, index }) {
  const translateX = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      delay: index * 100,
    }).start();
  }, []);

  return <Animated.View style={{ transform: [{ translateX }], marginBottom: 12 }}>{children}</Animated.View>;
}
