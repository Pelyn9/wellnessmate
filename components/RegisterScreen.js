import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebaseConfig";
import AnimatedButton from "./AnimatedButton";

const totalSteps = 4;

export default function RegisterScreen({ onRegister, onBack, theme, onToggleTheme }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [workout, setWorkout] = useState("");
  const [diet, setDiet] = useState("");

  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!name || !email || !password) {
        Alert.alert("Missing fields", "Please fill name, email, and password.");
        return false;
      }
      if (password.length < 6) {
        Alert.alert("Weak password", "Use at least 6 characters.");
        return false;
      }
    }

    if (step === 2) {
      if (!weight || !height) {
        Alert.alert("Missing fields", "Please provide weight and height.");
        return false;
      }
    }

    if (step === 3) {
      if (!workout || !diet) {
        Alert.alert("Missing fields", "Please provide workout frequency and diet preference.");
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      return;
    }

    setLoading(true);
    try {
      const result = await auth.createUserWithEmailAndPassword(email.trim(), password);
      await result.user.updateProfile({ displayName: name.trim() });
      await firestore.collection("users").doc(result.user.uid).set(
        {
          name: name.trim(),
          email: email.trim(),
          weight: weight.trim(),
          height: height.trim(),
          workout: workout.trim(),
          diet: diet.trim(),
          hydrationGoal: 8,
          notificationsEnabled: true,
          themeMode: "light",
          createdAt: new Date(),
        },
        { merge: true }
      );
      onRegister(result.user);
    } catch (error) {
      Alert.alert("Registration failed", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step === 1) return onBack?.();
    setStep((prev) => prev - 1);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.bgBubbleTop, { backgroundColor: theme.colors.primarySoft }]} />
      <View style={[styles.bgBubbleBottom, { backgroundColor: theme.colors.surfaceMuted }]} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.themeButtonWrap}>
          <TouchableOpacity
            onPress={onToggleTheme}
            style={[styles.themeBtn, { backgroundColor: theme.colors.surface }]}
            activeOpacity={0.9}
          >
            <Ionicons
              name={theme.isDark ? "sunny-outline" : "moon-outline"}
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { maxWidth: wide ? 500 : 440 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.stepText, { color: theme.colors.primary }]}>
              Step {step} of {totalSteps}
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Your Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Build your profile to receive personalized wellness tracking.
            </Text>

            <StepIndicator step={step} theme={theme} />

            {step === 1 && (
              <View>
                <FieldLabel text="Full Name" theme={theme} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Juan Dela Cruz"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />

                <FieldLabel text="Email" theme={theme} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />

                <FieldLabel text="Password" theme={theme} />
                <View style={[styles.passwordWrap, { backgroundColor: theme.colors.input }]}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={theme.colors.placeholder}
                    style={[styles.passwordInput, { color: theme.colors.text }]}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <FieldLabel text="Weight (kg)" theme={theme} />
                <TextInput
                  value={weight}
                  onChangeText={(value) => setWeight(value.replace(/[^0-9.]/g, ""))}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />

                <FieldLabel text="Height (cm)" theme={theme} />
                <TextInput
                  value={height}
                  onChangeText={(value) => setHeight(value.replace(/[^0-9.]/g, ""))}
                  keyboardType="numeric"
                  placeholder="170"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />
              </View>
            )}

            {step === 3 && (
              <View>
                <FieldLabel text="Workout Frequency (days/week)" theme={theme} />
                <TextInput
                  value={workout}
                  onChangeText={(value) => setWorkout(value.replace(/[^0-9]/g, ""))}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />

                <FieldLabel text="Diet Preference" theme={theme} />
                <TextInput
                  value={diet}
                  onChangeText={setDiet}
                  placeholder="Balanced / Vegetarian / High Protein"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
                />
              </View>
            )}

            {step === 4 && (
              <View style={[styles.reviewCard, { backgroundColor: theme.colors.input }]}>
                <ReviewRow label="Name" value={name} theme={theme} />
                <ReviewRow label="Email" value={email} theme={theme} />
                <ReviewRow label="Weight" value={`${weight} kg`} theme={theme} />
                <ReviewRow label="Height" value={`${height} cm`} theme={theme} />
                <ReviewRow label="Workout/week" value={workout} theme={theme} />
                <ReviewRow label="Diet" value={diet} theme={theme} />
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: theme.colors.surfaceMuted }]}
                onPress={handlePrevious}
              >
                <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>
                  {step === 1 ? "Back to Login" : "Previous"}
                </Text>
              </TouchableOpacity>

              <AnimatedButton
                style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.7 }]}
                onPress={handleNext}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Creating..." : step === totalSteps ? "Create Account" : "Next"}
                </Text>
              </AnimatedButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepIndicator({ step, theme }) {
  return (
    <View style={styles.progressWrap}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={[
            styles.progressDot,
            {
              backgroundColor: item <= step ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

function ReviewRow({ label, value, theme }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: theme.colors.text }]}>{value || "-"}</Text>
    </View>
  );
}

function FieldLabel({ text, theme }) {
  return <Text style={[styles.label, { color: theme.colors.textMuted }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bgBubbleTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 150,
    top: -80,
    left: -60,
  },
  bgBubbleBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -100,
    right: -90,
  },
  themeButtonWrap: {
    position: "absolute",
    top: Platform.OS === "android" ? 30 : 14,
    right: 16,
    zIndex: 2,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    width: "100%",
    flexGrow: 0,
    alignSelf: "center",
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  stepText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  title: {
    marginTop: 4,
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  progressWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 38,
    height: 6,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  passwordWrap: {
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  reviewCard: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148,163,184,0.25)",
  },
  reviewLabel: {
    fontSize: 13,
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryBtn: {
    width: "44%",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  primaryBtn: {
    width: "54%",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
