import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  SafeAreaView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "./firebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function DietScreen() {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [newDay, setNewDay] = useState("Monday");
  const [meal, setMeal] = useState("Breakfast");
  const [plan, setPlan] = useState("");
  const [notes, setNotes] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success"); // "success" or "error"
  const toastOpacity = useState(new Animated.Value(0))[0];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore
      .collection("diets")
      .where("userId", "==", currentUser.uid)
      .onSnapshot(
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          list.sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0));
          setDiets(list);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching diets:", error);
          showToast("Error fetching diets", "error");
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1500);
    });
  };

  const handleAddDiet = async () => {
    if (!plan.trim()) {
      showToast("Please enter diet plan details.", "error");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please log in to add a diet plan.", "error");
      return;
    }

    const newDiet = {
      day: newDay,
      meal,
      plan,
      notes,
      dayIndex: days.indexOf(newDay),
      userId: currentUser.uid,
      createdAt: new Date(),
    };

    try {
      await firestore.collection("diets").add(newDiet);
      resetForm();
      showToast("Diet added successfully!", "success");
    } catch (err) {
      console.error("Error adding diet:", err);
      showToast("Failed to add diet", "error");
    }
  };

  const handleDeleteDiet = async (id) => {
    try {
      await firestore.collection("diets").doc(id).delete();
      showToast("Diet deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting diet:", err);
      showToast("Failed to delete diet", "error");
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setMeal("Breakfast");
    setPlan("");
    setNotes("");
    setNewDay("Monday");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Diet Manager</Text>

        {days.map((day) => {
          const dayDiets = diets.filter((d) => d.day === day);
          if (dayDiets.length === 0) return null;

          return (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day}</Text>
              {dayDiets.map((d) => (
                <View key={d.id} style={styles.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.meal}>{d.meal}</Text>
                      <Text style={styles.detail}>{d.plan}</Text>
                      {d.notes ? <Text style={styles.notes}>Notes: {d.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteDiet(d.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={22} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {diets.length === 0 && <Text style={styles.emptyText}>No diet plans yet. Add your first one!</Text>}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Diet Plan</Text>

            <Text style={styles.label}>Meal</Text>
            {Platform.OS === "web" ? (
              <select value={meal} onChange={(e) => setMeal(e.target.value)} style={styles.webSelect}>
                {meals.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <Picker
                selectedValue={meal}
                style={{ height: 50, marginBottom: 15, color: "#fff" }}
                onValueChange={setMeal}
              >
                {meals.map((m) => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
            )}

            <Text style={styles.label}>Day</Text>
            {Platform.OS === "web" ? (
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} style={styles.webSelect}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <Picker selectedValue={newDay} style={{ height: 50, marginBottom: 15, color: "#fff" }} onValueChange={setNewDay}>
                {days.map((d) => <Picker.Item key={d} label={d} value={d} />)}
              </Picker>
            )}

            <Text style={styles.label}>Diet Plan</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Oatmeal + Chicken Salad"
              placeholderTextColor="#999"
              value={plan}
              onChangeText={setPlan}
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add notes"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddDiet}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[
          styles.toast,
          { opacity: toastOpacity, backgroundColor: toastType === "success" ? "#4CAF50" : "#f87171" }
        ]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  header: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: Platform.OS === "android" ? 50 : 30, marginBottom: 15, textAlign: "center" },
  daySection: { marginBottom: 20 },
  dayTitle: { color: "#4CAF50", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  card: { backgroundColor: "#1C1C1C", padding: 15, borderRadius: 15, marginBottom: 10, elevation: 4 },
  meal: { color: "#fff", fontSize: 18, fontWeight: "600" },
  detail: { color: "#bbb", fontSize: 14 },
  notes: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  emptyText: { color: "#bbb", fontSize: 16, textAlign: "center", marginTop: 30 },
  addButton: { position: "absolute", bottom: 25, right: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: "#4CAF50", justifyContent: "center", alignItems: "center", elevation: 6 },
  deleteBtn: { justifyContent: "center", alignItems: "center", marginLeft: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#1C1C1C", borderRadius: 20, padding: 20 },
  modalHeader: { fontSize: 22, color: "#fff", fontWeight: "700", marginBottom: 15, textAlign: "center" },
  label: { color: "#bbb", marginBottom: 5, fontWeight: "600" },
  input: { backgroundColor: "#2A2A2A", color: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: { backgroundColor: "#4CAF50", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  saveText: { color: "#fff", fontWeight: "700" },
  cancelButton: { backgroundColor: "#999", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  cancelText: { color: "#fff", fontWeight: "700" },
  webSelect: { marginBottom: 15, padding: 8, borderRadius: 8, backgroundColor: "#2A2A2A", color: "#fff" },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 40,
    right: 40,
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  toastText: { color: "#fff", fontWeight: "700" },
});
