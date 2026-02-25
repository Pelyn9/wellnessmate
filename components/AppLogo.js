import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { buildShadow } from "./theme";

export default function AppLogo({ theme, size = 54, showTagline = true, align = "center", style }) {
  const leftAligned = align === "left";
  const badgeSize = Math.max(34, size);
  const innerSize = Math.round(badgeSize * 0.74);
  const initialsSize = Math.max(12, Math.round(badgeSize * 0.32));
  const nameSize = Math.max(18, Math.round(badgeSize * 0.34));
  const metaSize = Math.max(10, Math.round(badgeSize * 0.18));

  return (
    <View style={[styles.wrap, { alignItems: leftAligned ? "flex-start" : "center" }, style]}>
      <View style={[styles.brandRow, { justifyContent: leftAligned ? "flex-start" : "center" }]}>
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: Math.round(badgeSize * 0.32),
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
            },
            buildShadow(theme, 2),
          ]}
        >
          <View
            style={[
              styles.orbPrimary,
              {
                backgroundColor: theme.colors.primary,
                width: Math.round(badgeSize * 0.72),
                height: Math.round(badgeSize * 0.72),
                borderRadius: Math.round(badgeSize * 0.36),
              },
            ]}
          />
          <View
            style={[
              styles.orbAccent,
              {
                backgroundColor: theme.colors.accent,
                width: Math.round(badgeSize * 0.52),
                height: Math.round(badgeSize * 0.52),
                borderRadius: Math.round(badgeSize * 0.26),
              },
            ]}
          />
          <View
            style={[
              styles.centerPlate,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: Math.round(innerSize * 0.25),
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.initials, { fontSize: initialsSize, color: theme.colors.text }]}>WM</Text>
          </View>
        </View>

        <View style={[styles.textGroup, { alignItems: leftAligned ? "flex-start" : "center" }]}>
          <Text style={[styles.name, { color: theme.colors.text, fontSize: nameSize }]}>WellnessMate</Text>
          <Text style={[styles.meta, { color: theme.colors.primary, fontSize: metaSize }]}>
            Daily Wellness Tracker
          </Text>
        </View>
      </View>
      {showTagline ? (
        <Text
          style={[
            styles.tagline,
            { color: theme.colors.textMuted, textAlign: leftAligned ? "left" : "center" },
          ]}
        >
          Move well. Eat smart. Stay consistent.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  orbPrimary: {
    position: "absolute",
    top: -8,
    left: -8,
  },
  orbAccent: {
    position: "absolute",
    bottom: -6,
    right: -6,
    opacity: 0.95,
  },
  centerPlate: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  textGroup: {
    marginLeft: 10,
  },
  name: {
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  meta: {
    marginTop: 1,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tagline: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },
});
