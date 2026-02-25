export const themeModes = {
  light: "light",
  dark: "dark",
};

const themes = {
  light: {
    background: "#f4f7fb",
    surface: "#ffffff",
    surfaceMuted: "#eef3f8",
    text: "#0f172a",
    textMuted: "#546278",
    border: "#d6e0ec",
    primary: "#0ea5a4",
    primarySoft: "#d6f5f0",
    accent: "#2563eb",
    danger: "#ef4444",
    success: "#16a34a",
    warning: "#d97706",
    nav: "#ffffff",
    input: "#f8fafc",
    placeholder: "#8fa2b8",
    shadow: "rgba(15, 23, 42, 0.08)",
    overlay: "rgba(12, 19, 31, 0.35)",
  },
  dark: {
    background: "#08131d",
    surface: "#11202d",
    surfaceMuted: "#1a2d3b",
    text: "#e5edf7",
    textMuted: "#9bb0c5",
    border: "#2a3d4d",
    primary: "#2dd4bf",
    primarySoft: "#174340",
    accent: "#60a5fa",
    danger: "#f87171",
    success: "#22c55e",
    warning: "#f59e0b",
    nav: "#0d1b27",
    input: "#142837",
    placeholder: "#8da0b6",
    shadow: "rgba(0, 0, 0, 0.35)",
    overlay: "rgba(2, 8, 14, 0.65)",
  },
};

export const getTheme = (mode = themeModes.light) => {
  const currentMode = themes[mode] ? mode : themeModes.light;
  return {
    mode: currentMode,
    isDark: currentMode === themeModes.dark,
    colors: themes[currentMode],
  };
};

export const buildShadow = (theme, elevation = 10) => ({
  shadowColor: theme.colors.shadow,
  shadowOpacity: theme.isDark ? 0.25 : 0.14,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 12,
  elevation,
});

export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
