import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buildShadow } from "./theme";

export default function BottomNav({ setScreen, active, theme }) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const tabs = [
    { name: "Dashboard", icon: "home-outline" },
    { name: "Workout", icon: "barbell-outline" },
    { name: "Diet", icon: "restaurant-outline" },
    { name: "Music", icon: "musical-notes-outline" },
    { name: "Settings", icon: "settings-outline" },
  ];

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.nav,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.nav,
          wide && styles.navWide,
          Platform.OS === "web" && buildShadow(theme, 0),
        ]}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setScreen(tab.name)}
              style={[
                styles.tab,
                wide && styles.tabWide,
                isActive && {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.textMuted,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    paddingTop: 8,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "center",
    width: "100%",
    maxWidth: 1040,
  },
  navWide: {
    justifyContent: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 72,
    marginHorizontal: 2,
  },
  tabWide: {
    minWidth: 120,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
});
