import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebaseConfig";
import { buildShadow, daysOfWeek } from "./theme";

const tips = [
  "Consistency beats intensity. Focus on routines you can repeat.",
  "Add protein and vegetables in every main meal for steady energy.",
  "A 20-minute walk after meals improves recovery and glucose control.",
  "Hydration first: one glass before each meal is an easy habit.",
];

const toMondayIndex = (date) => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

const normalizeDay = (value) => (value || "").trim().toLowerCase();

export default function Dashboard({ theme }) {
  const [userProfile, setUserProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHydration, setSavingHydration] = useState(false);

  const uid = auth.currentUser?.uid;
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDesktop = width >= 860;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubUser = firestore
      .collection("users")
      .doc(uid)
      .onSnapshot(
        (doc) => setUserProfile(doc.exists ? doc.data() : null),
        (err) => console.log("User profile error:", err?.message)
      );

    const unsubWorkouts = firestore
      .collection("workouts")
      .where("userId", "==", uid)
      .onSnapshot(
        (snapshot) => {
          setWorkouts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        },
        (err) => {
          console.log("Workout fetch error:", err?.message);
          setLoading(false);
        }
      );

    const unsubDiets = firestore
      .collection("diets")
      .where("userId", "==", uid)
      .onSnapshot(
        (snapshot) => setDiets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
        (err) => console.log("Diet fetch error:", err?.message)
      );

    return () => {
      unsubUser();
      unsubWorkouts();
      unsubDiets();
    };
  }, [uid]);

  const now = new Date();
  const todayIndex = toMondayIndex(now);
  const todayDay = daysOfWeek[todayIndex];
  const todayKey = now.toISOString().slice(0, 10);

  const dayCounts = useMemo(
    () =>
      daysOfWeek.map((day) => {
        const workoutsCount = workouts.filter((x) => normalizeDay(x.day) === normalizeDay(day)).length;
        const dietCount = diets.filter((x) => normalizeDay(x.day) === normalizeDay(day)).length;
        return { day, workouts: workoutsCount, diets: dietCount };
      }),
    [workouts, diets]
  );

  const totalWorkouts = workouts.length;
  const totalDiets = diets.length;
  const activeDays = dayCounts.filter((x) => x.workouts > 0 || x.diets > 0).length;

  let consistencyStreak = 0;
  for (let index = todayIndex; index >= 0; index -= 1) {
    const row = dayCounts[index];
    if (row.workouts > 0 || row.diets > 0) {
      consistencyStreak += 1;
    } else {
      break;
    }
  }

  const todayWorkouts = dayCounts[todayIndex]?.workouts || 0;
  const todayMeals = dayCounts[todayIndex]?.diets || 0;
  const maxCount = Math.max(1, ...dayCounts.map((item) => Math.max(item.workouts, item.diets)));

  const hydrationGoal = Number(userProfile?.hydrationGoal || 8);
  const hydrationLog = userProfile?.hydrationLog || {};
  const hydrationValue = Number(hydrationLog[todayKey] || 0);
  const hydrationPct = Math.min(100, Math.round((hydrationValue / hydrationGoal) * 100));

  const tip = tips[now.getDate() % tips.length];

  const updateHydration = async (delta) => {
    if (!uid || savingHydration) return;
    const nextValue = Math.max(0, Math.min(15, hydrationValue + delta));
    const nextLog = { ...(hydrationLog || {}), [todayKey]: nextValue };

    setSavingHydration(true);
    try {
      await firestore
        .collection("users")
        .doc(uid)
        .set({ hydrationLog: nextLog }, { merge: true });
    } catch (error) {
      console.log("Hydration update failed:", error?.message);
    } finally {
      setSavingHydration(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading dashboard...</Text>
      </View>
    );
  }

  const summaryCards = [
    { label: "Workouts", value: totalWorkouts, icon: "barbell-outline", color: theme.colors.primary },
    { label: "Meals", value: totalDiets, icon: "restaurant-outline", color: theme.colors.accent },
    { label: "Active Days", value: activeDays, icon: "calendar-outline", color: theme.colors.success },
    { label: "Streak", value: `${consistencyStreak}d`, icon: "flame-outline", color: theme.colors.warning },
  ];

  return (
    <Animated.View style={[styles.screen, { opacity: fadeAnim, backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrap, { maxWidth: isDesktop ? 1040 : 720 }]}>
          <View style={[styles.hero, { backgroundColor: theme.colors.surface }, buildShadow(theme, 8)]}>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
              Welcome back, {userProfile?.name || "Athlete"}
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.colors.textMuted }]}>
              {todayDay}: {todayWorkouts} workout{todayWorkouts === 1 ? "" : "s"} and {todayMeals} meal plan
              {todayMeals === 1 ? "" : "s"} tracked
            </Text>
            <View style={styles.tipRow}>
              <Ionicons name="sparkles-outline" size={18} color={theme.colors.warning} />
              <Text style={[styles.tipText, { color: theme.colors.textMuted }]}>{tip}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {summaryCards.map((card) => (
              <View
                key={card.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    width: isDesktop ? "24%" : "48.5%",
                  },
                  buildShadow(theme, 3),
                ]}
              >
                <Ionicons name={card.icon} size={20} color={card.color} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{card.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }, buildShadow(theme, 6)]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Hydration Tracker</Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]}>
                {hydrationValue}/{hydrationGoal} glasses
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${hydrationPct}%`,
                    backgroundColor: hydrationPct >= 100 ? theme.colors.success : theme.colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.hydrationActions}>
              <TouchableOpacity
                onPress={() => updateHydration(-1)}
                style={[styles.hydrationBtn, { borderColor: theme.colors.border }]}
                disabled={savingHydration}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.hydrationValue, { color: theme.colors.text }]}>{hydrationPct}%</Text>
              <TouchableOpacity
                onPress={() => updateHydration(1)}
                style={[styles.hydrationBtn, { borderColor: theme.colors.border }]}
                disabled={savingHydration}
              >
                <Ionicons name="add" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }, buildShadow(theme, 6)]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weekly Breakdown</Text>
            {dayCounts.map((item) => {
              const hasData = item.workouts > 0 || item.diets > 0;
              if (!hasData) return null;

              const workoutWidth = Math.max(8, Math.round((item.workouts / maxCount) * 100));
              const dietWidth = Math.max(8, Math.round((item.diets / maxCount) * 100));
              return (
                <View key={item.day} style={styles.dayRow}>
                  <Text style={[styles.dayLabel, { color: theme.colors.text }]}>{item.day}</Text>

                  {!!item.workouts && (
                    <View style={styles.metricRow}>
                      <Ionicons name="barbell-outline" size={15} color={theme.colors.primary} />
                      <View style={[styles.metricTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <View
                          style={[
                            styles.metricFill,
                            { width: `${workoutWidth}%`, backgroundColor: theme.colors.primary },
                          ]}
                        />
                      </View>
                      <Text style={[styles.metricValue, { color: theme.colors.textMuted }]}>{item.workouts}</Text>
                    </View>
                  )}

                  {!!item.diets && (
                    <View style={styles.metricRow}>
                      <Ionicons name="restaurant-outline" size={15} color={theme.colors.accent} />
                      <View style={[styles.metricTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <View
                          style={[
                            styles.metricFill,
                            { width: `${dietWidth}%`, backgroundColor: theme.colors.accent },
                          ]}
                        />
                      </View>
                      <Text style={[styles.metricValue, { color: theme.colors.textMuted }]}>{item.diets}</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {!totalWorkouts && !totalDiets && (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No activity yet. Add your first workout or meal plan.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  hero: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipText: {
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    height: 11,
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  hydrationActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  hydrationBtn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hydrationValue: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 24,
  },
  dayRow: {
    marginTop: 14,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metricTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    borderRadius: 6,
  },
  metricValue: {
    width: 20,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
});
