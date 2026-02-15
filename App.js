import React, { useState, useEffect } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import Dashboard from "./components/Dashboard";
import WorkoutScreen from "./components/WorkoutScreen";
import DietScreen from "./components/DietScreen";
import SettingsScreen from "./components/SettingsScreen";
import ProfileScreen from "./components/ProfileScreen";
import BottomNav from "./components/BottomNav";
import { auth } from "./components/firebaseConfig";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active bottom tab
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Track sub-screen inside Settings
  const [settingsSubScreen, setSettingsSubScreen] = useState(null);

  // Show register screen
  const [showRegister, setShowRegister] = useState(false);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterScreen
        onRegister={(u) => setUser(u)}
        onBack={() => setShowRegister(false)}
      />
    ) : (
      <LoginScreen
        onLogin={(u) => setUser(u)}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  // Main screen rendering based on activeTab
  const renderScreen = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard user={user} onLogout={() => auth.signOut().then(() => setUser(null))} />;
      case "Workout":
        return <WorkoutScreen />;
      case "Diet":
        return <DietScreen />;
      case "Settings":
        if (settingsSubScreen === "Profile") {
          return <ProfileScreen goBack={() => setSettingsSubScreen(null)} />;
        }
        return (
          <SettingsScreen
            user={user}
            onProfile={() => setSettingsSubScreen("Profile")}
            onLogoutSuccess={() => setUser(null)}
          />
        );
      default:
        return <Dashboard user={user} onLogout={() => auth.signOut().then(() => setUser(null))} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar barStyle="light-content" />
      
      {/* Render main content */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomNav active={activeTab} setScreen={setActiveTab} />
    </View>
  );
}
