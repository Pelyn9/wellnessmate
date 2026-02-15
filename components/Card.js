import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
});
