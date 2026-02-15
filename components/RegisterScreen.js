import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { auth, firestore } from "./firebaseConfig";
import AnimatedButton from "./AnimatedButton";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen({ onRegister, onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [workout, setWorkout] = useState("");
  const [diet, setDiet] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!name || !email || !password) return Alert.alert("Error", "Please fill all fields");
      try {
        const res = await auth.createUserWithEmailAndPassword(email, password);
        await res.user.updateProfile({ displayName: name });
        setStep(2);
      } catch (err) {
        Alert.alert("Error", err.message);
      }
    } else if (step === 2) {
      if (!weight) return Alert.alert("Error", "Enter your weight");
      setStep(3);
    } else if (step === 3) {
      if (!height) return Alert.alert("Error", "Enter your height");
      setStep(4);
    } else if (step === 4) {
      if (!workout || !diet) return Alert.alert("Error", "Fill workout and diet preference");
      const uid = auth.currentUser.uid;
      await firestore.collection("users").doc(uid).set({
        name, email, weight, height, workout, diet
      });
      onRegister(auth.currentUser);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.stepText}>Step {step}/4</Text>
          <Text style={styles.title}>Create Account</Text>

          {step === 1 && (
            <>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  style={[styles.input, { flex: 1 }]}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#aaa" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 2 && (
            <TextInput
              placeholder="Weight (kg)"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          )}

          {step === 3 && (
            <TextInput
              placeholder="Height (cm)"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          )}

          {step === 4 && (
            <>
              <TextInput
                placeholder="Workout frequency/week"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={workout}
                onChangeText={setWorkout}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Diet preference (Veg/Meat/Balance)"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={diet}
                onChangeText={setDiet}
              />
            </>
          )}

          <AnimatedButton style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{step === 4 ? "Done" : "Next"}</Text>
          </AnimatedButton>

          <Text style={styles.backText} onPress={onBack}>
            Already have an account? Login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  innerContainer: { flex: 1, justifyContent: "center", padding: 20, paddingTop: 100 },
  stepText: { color: "#4CAF50", fontWeight: "bold", fontSize: 18, marginBottom: 10, textAlign: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#1E1E1E", color: "#fff", padding: 15, borderRadius: 12, marginBottom: 12 },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  eyeIcon: { padding: 12, position: "absolute", right: 10 },
  button: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, marginTop: 15 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  backText: { color: "#4CAF50", textAlign: "center", marginTop: 15, fontWeight: "bold" },
});
