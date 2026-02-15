import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "./firebaseConfig";

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!uid) return;

    // Fetch user profile
    const unsubUser = firestore
      .collection("users")
      .doc(uid)
      .onSnapshot(
        (doc) => setUserProfile(doc.exists ? doc.data() : null),
        (err) => console.error("User fetch error:", err)
      );

    // Fetch workouts
    const unsubWorkouts = firestore
      .collection("workouts")
      .where("userId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setWorkouts(list);
        },
        (err) => console.error("Workout fetch error:", err)
      );

    // Fetch diets
    const unsubDiets = firestore
      .collection("diets")
      .where("userId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setDiets(list);
        },
        (err) => console.error("Diet fetch error:", err)
      );

    // Stop loading after first fetch
    const timer = setTimeout(() => setLoading(false), 600);

    return () => {
      unsubUser();
      unsubWorkouts();
      unsubDiets();
      clearTimeout(timer);
    };
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Count workouts and diets per day
  const dayCounts = allDays
    .map((day) => {
      const w = workouts.filter(
        (x) => x.day?.toLowerCase() === day.toLowerCase()
      ).length;
      const d = diets.filter(
        (x) => x.day?.toLowerCase() === day.toLowerCase()
      ).length;
      return { day, workouts: w, diets: d };
    })
    .filter(({ workouts, diets }) => workouts > 0 || diets > 0);

  const totalWorkouts = workouts.length;
  const totalDiets = diets.length;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>
          Welcome, <Text style={{ color: "#10b981" }}>{userProfile?.name || "User"}</Text>
        </Text>
        <Text style={styles.subtitle}>Your Weekly Wellness Summary</Text>

        {/* Overview Cards */}
        <View style={styles.statRow}>
          <StatCard
            label="Workouts"
            value={totalWorkouts}
            color="#10b981"
            icon="barbell-outline"
          />
          <StatCard
            label="Diet Plans"
            value={totalDiets}
            color="#3b82f6"
            icon="restaurant-outline"
          />
        </View>

        {/* Daily Breakdown */}
        {dayCounts.length > 0 && (
          <Text style={styles.sectionHeader}>Daily Breakdown</Text>
        )}

        {dayCounts.map(({ day, workouts, diets }) => (
          <View key={day} style={styles.dayCard}>
            <Text style={styles.dayName}>{day}</Text>

            {workouts > 0 && (
              <View style={styles.row}>
                <Ionicons name="barbell-outline" size={18} color="#10b981" />
                <View style={styles.barContainer}>
                  <Animated.View
                    style={[
                      styles.bar,
                      { width: workouts * 45, backgroundColor: "#10b981" },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{workouts}</Text>
              </View>
            )}

            {diets > 0 && (
              <View style={styles.row}>
                <Ionicons name="restaurant-outline" size={18} color="#3b82f6" />
                <View style={styles.barContainer}>
                  <Animated.View
                    style={[
                      styles.bar,
                      { width: diets * 45, backgroundColor: "#3b82f6" },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{diets}</Text>
              </View>
            )}
          </View>
        ))}

        {totalWorkouts === 0 && totalDiets === 0 && (
          <Text style={styles.emptyText}>
            No data yet. Add workouts or diet plans to start tracking!
          </Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

/* --- StatCard Component --- */
function StatCard({ label, value, color, icon }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color + "22" }]}>
      <Ionicons name={icon} size={26} color={color} style={{ marginBottom: 6 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingTop: 70, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10, fontSize: 15 },
  greeting: { color: "#fff", fontSize: 26, fontWeight: "700", textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: 15, textAlign: "center", marginBottom: 25 },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20, borderRadius: 16, marginHorizontal: 6 },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { color: "#94a3b8", fontSize: 14 },
  sectionHeader: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10, marginTop: 10 },
  dayCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 15, marginBottom: 12 },
  dayName: { color: "#10b981", fontWeight: "700", fontSize: 16, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barContainer: { flex: 1, height: 8, backgroundColor: "#334155", borderRadius: 5, marginHorizontal: 10, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 5 },
  barCount: { color: "#cbd5e1", fontSize: 13, width: 25, textAlign: "center" },
  emptyText: { color: "#94a3b8", fontSize: 15, textAlign: "center", marginTop: 20 },
});
