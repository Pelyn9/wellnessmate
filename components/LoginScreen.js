import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./firebaseConfig";
import AnimatedButton from "./AnimatedButton";
import AppLogo from "./AppLogo";

export default function LoginScreen({ onLogin, onRegister, theme, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email.trim(), password);
      onLogin(result.user);
    } catch (error) {
      Alert.alert("Login failed", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
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

        <View style={[styles.card, { backgroundColor: theme.colors.surface, maxWidth: wide ? 460 : 420 }]}>
          <AppLogo theme={theme} size={48} />

          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Sign in to continue your fitness and nutrition tracking.
          </Text>

          <FieldLabel text="Email" theme={theme} />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.input, color: theme.colors.text }]}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <FieldLabel text="Password" theme={theme} />
          <View style={[styles.passwordWrap, { backgroundColor: theme.colors.input }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.text }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <AnimatedButton
            style={[styles.submitBtn, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
          >
            <Text style={styles.submitText}>{loading ? "Signing In..." : "Sign In"}</Text>
          </AnimatedButton>

          <TouchableOpacity onPress={onRegister} style={styles.footerLink}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>No account yet?</Text>
            <Text style={[styles.footerAction, { color: theme.colors.primary }]}> Create one</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ text, theme }) {
  return <Text style={[styles.label, { color: theme.colors.textMuted }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    marginTop: 4,
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
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
  submitBtn: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  footerLink: {
    marginTop: 14,
    alignSelf: "center",
    flexDirection: "row",
  },
  footerText: {
    fontSize: 13,
  },
  footerAction: {
    fontSize: 13,
    fontWeight: "700",
  },
});
