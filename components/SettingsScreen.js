import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebaseConfig";
import { buildShadow, themeModes } from "./theme";

export default function SettingsScreen({
  onProfile,
  onLogoutSuccess,
  onThemeChange,
  currentThemeMode,
  theme,
}) {
  const [profile, setProfile] = useState({ name: "", photo: null, email: "" });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const uid = auth.currentUser?.uid;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = firestore
      .collection("users")
      .doc(uid)
      .onSnapshot((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        setProfile({
          name: data.name || "",
          photo: data.photo || null,
          email: data.email || auth.currentUser?.email || "",
          hydrationGoal: Number(data.hydrationGoal || 8),
          notificationsEnabled: data.notificationsEnabled !== false,
        });
      });
    return () => unsubscribe();
  }, [uid]);

  const updateUserDoc = async (nextData) => {
    if (!uid || saving) return;
    setSaving(true);
    try {
      await firestore.collection("users").doc(uid).set(nextData, { merge: true });
    } catch (error) {
      console.log("Settings update failed:", error?.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = () => {
    const next = currentThemeMode === themeModes.light ? themeModes.dark : themeModes.light;
    onThemeChange(next);
  };

  const handleToggleNotifications = () => {
    const nextValue = !profile.notificationsEnabled;
    setProfile((prev) => ({ ...prev, notificationsEnabled: nextValue }));
    updateUserDoc({ notificationsEnabled: nextValue });
  };

  const handleHydrationGoalChange = (delta) => {
    const current = Number(profile.hydrationGoal || 8);
    const next = Math.max(4, Math.min(15, current + delta));
    setProfile((prev) => ({ ...prev, hydrationGoal: next }));
    updateUserDoc({ hydrationGoal: next });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setLogoutModalVisible(false);
      onLogoutSuccess?.();
    } catch (error) {
      console.log("Logout failed:", error?.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentWrap, { maxWidth: isDesktop ? 1020 : 760 }]}>
        <View style={[styles.hero, { backgroundColor: theme.colors.surface }, buildShadow(theme, 8)]}>
          <View style={styles.profileRow}>
            {profile.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.profilePic} />
            ) : (
              <View style={[styles.profileFallback, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="person-outline" size={28} color={theme.colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{profile.name || "Wellness User"}</Text>
              <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                {profile.email || auth.currentUser?.email || "No email"}
              </Text>
            </View>
            <TouchableOpacity onPress={onProfile} style={[styles.inlineBtn, { borderColor: theme.colors.border }]}>
              <Ionicons name="create-outline" size={17} color={theme.colors.primary} />
              <Text style={[styles.inlineBtnText, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Appearance</Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <View style={styles.settingLeft}>
            <Ionicons
              name={currentThemeMode === themeModes.dark ? "moon-outline" : "sunny-outline"}
              size={21}
              color={theme.colors.primary}
            />
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Theme Mode</Text>
              <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
                {currentThemeMode === themeModes.dark ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
          </View>
          <Switch
            value={currentThemeMode === themeModes.dark}
            onValueChange={toggleTheme}
            thumbColor={currentThemeMode === themeModes.dark ? theme.colors.primary : "#f1f5f9"}
            trackColor={{ true: theme.colors.primarySoft, false: theme.colors.border }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Preferences</Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={21} color={theme.colors.accent} />
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Daily Reminders</Text>
              <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
                Notification nudges for workouts and meals
              </Text>
            </View>
          </View>
          <Switch
            value={!!profile.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            thumbColor={profile.notificationsEnabled ? theme.colors.accent : "#f1f5f9"}
            trackColor={{ true: theme.colors.primarySoft, false: theme.colors.border }}
          />
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <View style={styles.settingLeft}>
            <Ionicons name="water-outline" size={21} color={theme.colors.warning} />
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Daily Hydration Goal</Text>
              <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
                Set target glasses per day (4 to 15)
              </Text>
            </View>
          </View>
          <View style={styles.goalControls}>
            <TouchableOpacity
              style={[styles.goalBtn, { borderColor: theme.colors.border }]}
              onPress={() => handleHydrationGoalChange(-1)}
            >
              <Ionicons name="remove" size={18} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.goalValue, { color: theme.colors.text }]}>
              {profile.hydrationGoal || 8}
            </Text>
            <TouchableOpacity
              style={[styles.goalBtn, { borderColor: theme.colors.border }]}
              onPress={() => handleHydrationGoalChange(1)}
            >
              <Ionicons name="add" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Support</Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <View style={styles.settingLeft}>
            <Ionicons name="help-circle-outline" size={21} color={theme.colors.success} />
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Coaching Tip</Text>
              <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
                Keep workouts realistic for weekdays, then progress weekly.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={21} color={theme.colors.danger} />
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons
              name="log-out-outline"
              size={36}
              color={theme.colors.danger}
              style={{ alignSelf: "center", marginBottom: 6 }}
            />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Sign out of WellnessMate?</Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textMuted }]}>
              You can log in again anytime with the same account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.colors.surfaceMuted }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.colors.danger }]}
                onPress={handleLogout}
              >
                <Text style={styles.modalBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 12,
  },
  profileFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  email: {
    marginTop: 2,
    fontSize: 13,
  },
  inlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineBtnText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  settingCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  settingTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  settingSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
  },
  goalControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalBtn: {
    width: 30,
    height: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  goalValue: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 10,
  },
  logoutCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  modalMessage: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    width: "48.5%",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
