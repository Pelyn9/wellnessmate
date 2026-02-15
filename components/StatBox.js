import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatBox({ label, value, icon }) {
  return (
    <View style={styles.box}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    marginHorizontal: 6,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 50,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 2,
  },
});
