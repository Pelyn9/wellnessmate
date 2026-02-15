import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Image, Alert, TouchableOpacity } from "react-native";
import { auth } from "./firebaseConfig";
import AnimatedButton from "./AnimatedButton";

export default function LoginScreen({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // false = hidden

  const handleLogin = () => {
    if (!email || !password) return Alert.alert("Error", "Fill all fields");
    auth
      .signInWithEmailAndPassword(email, password)
      .then((res) => onLogin(res.user))
      .catch((err) => Alert.alert("Login Failed", err.message));
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/2966/2966481.png" }}
        style={styles.logo}
      />
      <Text style={styles.title}>WellnessMate</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#bbb"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          placeholderTextColor="#bbb"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.showHideBtn}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={{ color: "#4CAF50", fontWeight: "bold" }}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <AnimatedButton style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </AnimatedButton>

      <Text style={styles.registerText} onPress={onRegister}>
        Don't have an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#4CAF50", marginBottom: 30 },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
  },
  passwordWrapper: {
    width: "100%",
    position: "relative",
    marginVertical: 8,
  },
  inputPassword: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    paddingRight: 70, // space for the Show/Hide button
  },
  showHideBtn: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  button: { width: "100%", backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, marginTop: 15, alignSelf: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  registerText: { color: "#4CAF50", fontWeight: "bold", marginTop: 15 },
});
