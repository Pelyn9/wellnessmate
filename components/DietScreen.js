import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebaseConfig";
import { buildShadow, daysOfWeek } from "./theme";

const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function DietScreen({ theme }) {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [newDay, setNewDay] = useState("Monday");
  const [meal, setMeal] = useState("Breakfast");
  const [plan, setPlan] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success");
  const toastOpacity = useState(new Animated.Value(0))[0];

  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

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
          const list = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              dayIndex: data.dayIndex ?? daysOfWeek.indexOf(data.day),
              completed: Boolean(data.completed),
            };
          });
          list.sort((a, b) => a.dayIndex - b.dayIndex);
          setDiets(list);
          setLoading(false);
        },
        (error) => {
          console.log("Diet fetch failed:", error?.message);
          showToast("Failed to load meals", "error");
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
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1600);
    });
  };

  const resetForm = () => {
    setModalVisible(false);
    setNewDay("Monday");
    setMeal("Breakfast");
    setPlan("");
    setCalories("");
    setNotes("");
  };

  const handleAddDiet = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please log in again", "error");
      return;
    }
    if (!plan.trim()) {
      showToast("Enter meal plan details", "error");
      return;
    }

    const payload = {
      userId: currentUser.uid,
      day: newDay,
      dayIndex: daysOfWeek.indexOf(newDay),
      meal,
      plan: plan.trim(),
      notes: notes.trim(),
      calories: calories ? Number(calories) : 0,
      completed: false,
      createdAt: new Date(),
    };

    try {
      await firestore.collection("diets").add(payload);
      showToast("Meal plan added");
      resetForm();
    } catch (error) {
      console.log("Add diet failed:", error?.message);
      showToast("Failed to add meal", "error");
    }
  };

  const handleDeleteDiet = async (id) => {
    try {
      await firestore.collection("diets").doc(id).delete();
      showToast("Meal removed");
    } catch (error) {
      console.log("Delete diet failed:", error?.message);
      showToast("Delete failed", "error");
    }
  };

  const handleToggleCompleted = async (item) => {
    try {
      await firestore.collection("diets").doc(item.id).set(
        {
          completed: !item.completed,
        },
        { merge: true }
      );
      showToast(!item.completed ? "Marked prepared" : "Marked planned");
    } catch (error) {
      console.log("Toggle diet failed:", error?.message);
      showToast("Update failed", "error");
    }
  };

  const filteredDiets = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return diets.filter((item) => {
      const matchSearch =
        !keyword ||
        item.plan?.toLowerCase().includes(keyword) ||
        item.notes?.toLowerCase().includes(keyword);
      const matchMeal = mealFilter === "All" || item.meal === mealFilter;
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Prepared" && item.completed) ||
        (statusFilter === "Planned" && !item.completed);
      return matchSearch && matchMeal && matchStatus;
    });
  }, [diets, search, mealFilter, statusFilter]);

  const groupedDiets = useMemo(() => {
    return daysOfWeek
      .map((day) => ({
        day,
        entries: filteredDiets.filter((item) => item.day === day),
      }))
      .filter((block) => block.entries.length > 0);
  }, [filteredDiets]);

  const summary = useMemo(() => {
    const totalMeals = diets.length;
    const preparedMeals = diets.filter((item) => item.completed).length;
    const totalCalories = diets.reduce((sum, item) => sum + Number(item.calories || 0), 0);
    return { totalMeals, preparedMeals, totalCalories };
  }, [diets]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrap, { maxWidth: isDesktop ? 1060 : 760 }]}>
          <Text style={[styles.header, { color: theme.colors.text }]}>Nutrition Planner</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Build practical meals, estimate calories, and track prepared plans.
          </Text>

          <View style={styles.statsRow}>
            <StatPill label="Planned Meals" value={summary.totalMeals} color={theme.colors.primary} theme={theme} />
            <StatPill
              label="Prepared"
              value={summary.preparedMeals}
              color={theme.colors.success}
              theme={theme}
            />
            <StatPill
              label="Est. Calories"
              value={summary.totalCalories}
              color={theme.colors.warning}
              theme={theme}
            />
          </View>

          <View style={[styles.searchCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 4)]}>
            <View
              style={[
                styles.searchInputWrap,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.input },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search plans or notes"
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
            </View>

            <View style={styles.filterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FilterChip
                  label="All Meals"
                  active={mealFilter === "All"}
                  onPress={() => setMealFilter("All")}
                  theme={theme}
                />
                {mealOptions.map((item) => (
                  <FilterChip
                    key={item}
                    label={item}
                    active={mealFilter === item}
                    onPress={() => setMealFilter(item)}
                    theme={theme}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterRow}>
              {["All", "Planned", "Prepared"].map((label) => (
                <FilterChip
                  key={label}
                  label={label}
                  active={statusFilter === label}
                  onPress={() => setStatusFilter(label)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {groupedDiets.map((group) => (
            <View key={group.day} style={styles.dayBlock}>
              <Text style={[styles.dayTitle, { color: theme.colors.text }]}>{group.day}</Text>
              {group.entries.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                    buildShadow(theme, 3),
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.mainWrap}>
                      <Text style={[styles.mealTitle, { color: theme.colors.text }]}>{item.meal}</Text>
                      <Text style={[styles.planText, { color: theme.colors.textMuted }]}>{item.plan}</Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => handleToggleCompleted(item)} style={styles.iconBtn}>
                        <Ionicons
                          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                          size={22}
                          color={item.completed ? theme.colors.success : theme.colors.textMuted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDiet(item.id)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Badge text={`${item.calories || 0} kcal`} color={theme.colors.warning} theme={theme} />
                    <Badge
                      text={item.completed ? "Prepared" : "Planned"}
                      color={item.completed ? theme.colors.success : theme.colors.accent}
                      theme={theme}
                    />
                  </View>

                  {!!item.notes && <Text style={[styles.notes, { color: theme.colors.textMuted }]}>{item.notes}</Text>}
                </View>
              ))}
            </View>
          ))}

          {!groupedDiets.length && (
            <View style={[styles.emptyBox, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No meal plans match your filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }, buildShadow(theme, 6)]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Meal Plan</Text>

              <FieldLabel text="Meal" theme={theme} />
              <View style={[styles.pickerWrap, { backgroundColor: theme.colors.input }]}>
                <Picker selectedValue={meal} onValueChange={setMeal} style={[styles.picker, { color: theme.colors.text }]}>
                  {mealOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>

              <FieldLabel text="Day" theme={theme} />
              <View style={[styles.pickerWrap, { backgroundColor: theme.colors.input }]}>
                <Picker
                  selectedValue={newDay}
                  onValueChange={setNewDay}
                  style={[styles.picker, { color: theme.colors.text }]}
                >
                  {daysOfWeek.map((day) => (
                    <Picker.Item key={day} label={day} value={day} />
                  ))}
                </Picker>
              </View>

              <FieldLabel text="Plan" theme={theme} />
              <TextInput
                style={[styles.input, styles.notesInput, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                value={plan}
                onChangeText={setPlan}
                placeholder="e.g. Oatmeal + eggs + fruit"
                placeholderTextColor={theme.colors.placeholder}
                multiline
              />

              <FieldLabel text="Estimated calories (optional)" theme={theme} />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                value={calories}
                onChangeText={(text) => setCalories(text.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                placeholder="450"
                placeholderTextColor={theme.colors.placeholder}
              />

              <FieldLabel text="Notes (optional)" theme={theme} />
              <TextInput
                style={[styles.input, styles.notesInput, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Prep or timing notes"
                placeholderTextColor={theme.colors.placeholder}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddDiet}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.surfaceMuted }]}
                  onPress={resetForm}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              backgroundColor: toastType === "success" ? theme.colors.success : theme.colors.danger,
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surfaceMuted,
          borderColor: active ? theme.colors.primary : "transparent",
        },
      ]}
    >
      <Text style={{ color: active ? theme.colors.primary : theme.colors.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FieldLabel({ text, theme }) {
  return <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{text}</Text>;
}

function StatPill({ label, value, color, theme }) {
  return (
    <View style={[styles.statPill, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function Badge({ text, color, theme }) {
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.surfaceMuted }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 27,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statPill: {
    width: "32%",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statPillValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statPillLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
  },
  searchCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterRow: {
    marginTop: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },
  dayBlock: {
    marginTop: 8,
    marginBottom: 6,
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  mainWrap: {
    flex: 1,
    paddingRight: 8,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  planText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 4,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginRight: 8,
    marginTop: 4,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 6,
  },
  notes: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBox: {
    borderRadius: 14,
    padding: 24,
    marginTop: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  addButton: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "84%",
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },
  fieldLabel: {
    marginBottom: 6,
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  pickerWrap: {
    borderRadius: 11,
    overflow: "hidden",
  },
  picker: {
    height: 46,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  modalButton: {
    width: "48.5%",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  toast: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 92,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
  },
});
