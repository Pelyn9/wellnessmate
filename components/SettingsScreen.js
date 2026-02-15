import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "./firebaseConfig";

export default function SettingsScreen({ onProfile, onLogoutSuccess }) {
  const [user, setUser] = useState({ name: "", photo: null });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = firestore
      .collection("users")
      .doc(uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setUser(doc.data());
        }
      });

    return () => unsubscribe();
  }, [uid]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setLogoutModalVisible(false);
      if (onLogoutSuccess) onLogoutSuccess();
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.profilePic} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#4CAF50" />
        )}
        <Text style={styles.profileName}>{user.name || "Your Name"}</Text>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.card} onPress={onProfile}>
        <View style={styles.cardLeft}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
          <Text style={styles.cardText}>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <TouchableOpacity style={styles.card}>
        <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
        <Text style={styles.cardText}>Notifications</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <Ionicons name="cafe-outline" size={24} color="#4CAF50" />
        <Text style={styles.cardText}>Diet Preferences</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <TouchableOpacity style={styles.card}>
        <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
        <Text style={styles.cardText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.card, styles.logout]}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Ionicons name="log-out-outline" size={24} color="red" />
        <Text style={[styles.cardText, { color: "red" }]}>Logout</Text>
      </TouchableOpacity>

      {/* Custom Logout Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="log-out-outline"
              size={40}
              color="red"
              style={{ alignSelf: "center", marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#f87171" }]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#f8fafc",
  },
  logout: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
