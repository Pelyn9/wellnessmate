// components/AnimatedButton.js
import React, { useRef } from "react";
import { TouchableOpacity, Animated } from "react-native";

export default function AnimatedButton({ onPress, children, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    onPress && onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
