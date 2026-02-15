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

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [newDay, setNewDay] = useState("Monday");
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("minutes");
  const [notes, setNotes] = useState("");

  const [uid, setUid] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const durationUnits = ["seconds", "minutes", "hours"];

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUid(user.uid);
      else setUid(null);
    });
    return unsubscribe;
  }, []);

  // Fetch workouts
  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    const unsubscribe = firestore
      .collection("workouts")
      .where("userId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .map((w) => ({ ...w, dayIndex: w.dayIndex ?? days.indexOf(w.day) }));
          data.sort((a, b) => a.dayIndex - b.dayIndex);
          setWorkouts(data);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching workouts:", error);
          showToast("Error fetching workouts");
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [uid]);

  const showToast = (message) => {
    setToastMessage(message);
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

  const handleAddWorkout = async () => {
    if (!exercise.trim()) {
      showToast("Please enter an exercise name");
      return;
    }

    if (!duration.trim() || isNaN(duration)) {
      showToast("Enter a valid number for duration");
      return;
    }

    if (!uid) {
      showToast("User not logged in");
      return;
    }

    const newWorkout = {
      userId: uid,
      day: newDay,
      exercise: exercise.trim(),
      sets: sets || "3",
      reps: reps || "10",
      duration: `${duration} ${durationUnit}`,
      notes: notes.trim(),
      dayIndex: days.indexOf(newDay),
      createdAt: new Date(),
    };

    try {
      await firestore.collection("workouts").add(newWorkout);
      resetForm();
      showToast("Workout added successfully!");
    } catch (err) {
      console.error("Error adding workout:", err);
      showToast("Failed to add workout");
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await firestore.collection("workouts").doc(id).delete();
      showToast("Workout deleted successfully!");
    } catch (err) {
      console.error("Error deleting workout:", err);
      showToast("Failed to delete workout");
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setExercise("");
    setSets("");
    setReps("");
    setDuration("");
    setDurationUnit("minutes");
    setNotes("");
    setNewDay("Monday");
  };

  if (loading || uid === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Workout Manager</Text>

        {days.map((day) => {
          const dayWorkouts = workouts.filter((w) => w.day === day);
          if (!dayWorkouts.length) return null;

          return (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day}</Text>
              {dayWorkouts.map((w) => (
                <View key={w.id} style={styles.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exercise}>{w.exercise}</Text>
                      <Text style={styles.detail}>Sets: {w.sets} | Reps: {w.reps}</Text>
                      <Text style={styles.detail}>Duration: {w.duration}</Text>
                      {w.notes ? <Text style={styles.notes}>Notes: {w.notes}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteWorkout(w.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={22} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {!workouts.length && (
          <Text style={styles.emptyText}>No workouts added yet. Start by creating one!</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Workout</Text>

            <Text style={styles.label}>Exercise</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bench Press"
              placeholderTextColor="#999"
              value={exercise}
              onChangeText={setExercise}
            />

            <Text style={styles.label}>Day</Text>
            {Platform.OS === "web" ? (
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} style={styles.webSelect}>
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <Picker
                selectedValue={newDay}
                style={{ height: 50, marginBottom: 15, color: "#fff" }}
                onValueChange={(item) => setNewDay(item)}
              >
                {days.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            )}

            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 3"
                  placeholderTextColor="#999"
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 12"
                  placeholderTextColor="#999"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Duration</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="e.g. 30"
                  placeholderTextColor="#999"
                  value={duration}
                  onChangeText={(text) => setDuration(text.replace(/[^0-9]/g, ""))}
                  keyboardType="numeric"
                />
                <Picker
                  selectedValue={durationUnit}
                  style={{ flex: 1, color: "#fff" }}
                  onValueChange={(item) => setDurationUnit(item)}
                >
                  {durationUnits.map((unit) => (
                    <Picker.Item key={unit} label={unit} value={unit} />
                  ))}
                </Picker>
              </View>
            </View>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add notes"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddWorkout}>
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
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
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
  exercise: { color: "#fff", fontSize: 18, fontWeight: "600" },
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
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInputContainer: { width: "48%" },
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
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  toastText: { color: "#fff", fontWeight: "700" },
});
