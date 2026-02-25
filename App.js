import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import Dashboard from "./components/Dashboard";
import WorkoutScreen from "./components/WorkoutScreen";
import DietScreen from "./components/DietScreen";
import MusicScreen from "./components/MusicScreen";
import SettingsScreen from "./components/SettingsScreen";
import ProfileScreen from "./components/ProfileScreen";
import BottomNav from "./components/BottomNav";
import { auth, firestore } from "./components/firebaseConfig";
import { getTheme, themeModes } from "./components/theme";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState(themeModes.light);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [settingsSubScreen, setSettingsSubScreen] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setThemeMode(themeModes.light);
      return;
    }

    const unsubscribe = firestore.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const remoteTheme = doc.data()?.themeMode;
      if (remoteTheme === themeModes.light || remoteTheme === themeModes.dark) {
        setThemeMode(remoteTheme);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (activeTab !== "Settings" && settingsSubScreen) {
      setSettingsSubScreen(null);
    }
  }, [activeTab, settingsSubScreen]);

  const handleThemeChange = async (nextMode) => {
    const safeMode = nextMode === themeModes.dark ? themeModes.dark : themeModes.light;
    setThemeMode(safeMode);

    if (!user?.uid) return;
    try {
      await firestore.collection("users").doc(user.uid).set(
        {
          themeMode: safeMode,
        },
        { merge: true }
      );
    } catch (error) {
      console.log("Theme preference save failed:", error?.message);
    }
  };

  const handleToggleTheme = () => {
    handleThemeChange(themeMode === themeModes.light ? themeModes.dark : themeModes.light);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterScreen
        onRegister={(u) => setUser(u)}
        onBack={() => setShowRegister(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    ) : (
      <LoginScreen
        onLogin={(u) => setUser(u)}
        onRegister={() => setShowRegister(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard user={user} theme={theme} />;
      case "Workout":
        return <WorkoutScreen theme={theme} />;
      case "Diet":
        return <DietScreen theme={theme} />;
      case "Music":
        return <MusicScreen theme={theme} />;
      case "Settings":
        if (settingsSubScreen === "Profile") {
          return <ProfileScreen goBack={() => setSettingsSubScreen(null)} theme={theme} />;
        }
        return (
          <SettingsScreen
            user={user}
            theme={theme}
            onProfile={() => setSettingsSubScreen("Profile")}
            onLogoutSuccess={() => setUser(null)}
            onThemeChange={handleThemeChange}
            currentThemeMode={themeMode}
          />
        );
      default:
        return <Dashboard user={user} theme={theme} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.background}
        barStyle={theme.isDark ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
      <BottomNav active={activeTab} setScreen={setActiveTab} theme={theme} />
    </View>
  );
}
