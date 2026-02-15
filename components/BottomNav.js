import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // optional icons

export default function BottomNav({ setScreen, active }) {
  const tabs = [
    { name: "Dashboard", icon: "home-outline" },
    { name: "Workout", icon: "barbell-outline" },
    { name: "Diet", icon: "restaurant-outline" },
    { name: "Settings", icon: "settings-outline" },
  ];

  return (
    <View style={styles.nav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => setScreen(tab.name)}
          style={[styles.tab, active === tab.name && styles.activeTab]}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={active === tab.name ? "#fff" : "#bbb"}
          />
          <Text style={[styles.label, active === tab.name && styles.activeLabel]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0f172a",
    // Removed border radius for straight edges
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 10,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    color: "#bbb",
    fontSize: 10,
    marginTop: 2,
  },
  activeLabel: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
