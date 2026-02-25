import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "./firebaseConfig";
import AnimatedButton from "./AnimatedButton";
import { buildShadow } from "./theme";

const dietOptions = ["Vegetable", "Meat", "Balanced"];
const genderOptions = ["Male", "Female", "Prefer not to say"];

const bmiCategory = (bmi) => {
  if (!bmi || Number.isNaN(bmi)) return "N/A";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export default function ProfileScreen({ goBack, theme }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [diet, setDiet] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null);
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(true);

  const uid = auth.currentUser?.uid;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  useEffect(() => {
    if (!uid) return;
    firestore
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        setName(data.name || "");
        setWeight(String(data.weight || ""));
        setHeight(String(data.height || ""));
        setDiet(data.diet || "");
        setGender(data.gender || "");
        setPhoto(data.photo || null);
      })
      .catch((error) => {
        console.log("Profile load error:", error?.message);
      });
  }, [uid]);

  const bmi = useMemo(() => {
    const weightValue = Number(weight);
    const heightValue = Number(height);
    if (!weightValue || !heightValue) return null;
    const meters = heightValue / 100;
    if (!meters) return null;
    return Number((weightValue / (meters * meters)).toFixed(1));
  }, [weight, height]);

  const showModal = (message, success = true) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 1900);
  };

  const pickImage = async () => {
    if (!editable) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    if (!name || !weight || !height || !diet || !gender) {
      showModal("Please complete all fields", false);
      return;
    }

    setSaving(true);
    try {
      await firestore
        .collection("users")
        .doc(uid)
        .set(
          {
            name: name.trim(),
            weight: weight.trim(),
            height: height.trim(),
            diet,
            gender,
            photo,
          },
          { merge: true }
        );
      showModal("Profile saved");
      setEditable(false);
    } catch (error) {
      showModal("Save failed", false);
      console.log("Profile save error:", error?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentWrap, { maxWidth: isDesktop ? 1020 : 760 }]}>
        <TouchableOpacity onPress={goBack} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="arrow-back" size={21} color={theme.colors.text} />
          <Text style={[styles.backText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 8)]}>
          <TouchableOpacity onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.profilePic} />
            ) : (
              <View style={[styles.profileFallback, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="person-outline" size={36} color={theme.colors.primary} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.profileName, { color: theme.colors.text }]}>{name || "My Profile"}</Text>
          <Text style={[styles.profileSub, { color: theme.colors.textMuted }]}>
            Keep your details updated for better recommendations.
          </Text>

          {!editable ? (
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
              onPress={() => setEditable(true)}
            >
              <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.editBtnText, { color: theme.colors.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
              onPress={() => setEditable(false)}
            >
              <Ionicons name="close-outline" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.editBtnText, { color: theme.colors.textMuted }]}>Cancel Editing</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.bmiCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <Text style={[styles.bmiTitle, { color: theme.colors.text }]}>Body Mass Index</Text>
          <Text style={[styles.bmiValue, { color: theme.colors.primary }]}>{bmi || "--"}</Text>
          <Text style={[styles.bmiCategory, { color: theme.colors.textMuted }]}>{bmiCategory(bmi)}</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.colors.surface }, buildShadow(theme, 5)]}>
          <FieldLabel text="Full Name" theme={theme} />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input, color: theme.colors.text },
              !editable && styles.readOnly,
            ]}
            value={name}
            onChangeText={setName}
            editable={editable}
            placeholder="Your name"
            placeholderTextColor={theme.colors.placeholder}
          />

          <View style={styles.twoColRow}>
            <View style={styles.twoCol}>
              <FieldLabel text="Weight (kg)" theme={theme} />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.input, color: theme.colors.text },
                  !editable && styles.readOnly,
                ]}
                value={weight}
                onChangeText={(value) => setWeight(value.replace(/[^0-9.]/g, ""))}
                editable={editable}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.twoCol}>
              <FieldLabel text="Height (cm)" theme={theme} />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.input, color: theme.colors.text },
                  !editable && styles.readOnly,
                ]}
                value={height}
                onChangeText={(value) => setHeight(value.replace(/[^0-9.]/g, ""))}
                editable={editable}
                keyboardType="numeric"
                placeholder="170"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
          </View>

          <FieldLabel text="Diet Preference" theme={theme} />
          <View style={styles.optionRow}>
            {dietOptions.map((item) => (
              <OptionButton
                key={item}
                label={item}
                selected={diet === item}
                onPress={() => editable && setDiet(item)}
                disabled={!editable}
                theme={theme}
              />
            ))}
          </View>

          <FieldLabel text="Gender" theme={theme} />
          <View style={styles.optionRow}>
            {genderOptions.map((item) => (
              <OptionButton
                key={item}
                label={item}
                selected={gender === item}
                onPress={() => editable && setGender(item)}
                disabled={!editable}
                theme={theme}
              />
            ))}
          </View>
        </View>

        {editable && (
          <AnimatedButton
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </AnimatedButton>
        )}
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: modalSuccess ? theme.colors.success : theme.colors.danger,
              },
            ]}
          >
            <Text
              style={[
                styles.modalText,
                { color: modalSuccess ? theme.colors.success : theme.colors.danger },
              ]}
            >
              {modalMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function FieldLabel({ text, theme }) {
  return <Text style={[styles.label, { color: theme.colors.textMuted }]}>{text}</Text>;
}

function OptionButton({ label, selected, onPress, disabled, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.optionBtn,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.input,
          borderColor: selected ? theme.colors.primary : "transparent",
          opacity: disabled ? 0.7 : 1,
        },
      ]}
      disabled={disabled}
    >
      <Text style={{ color: selected ? theme.colors.primary : theme.colors.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  profilePic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
  },
  profileFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  profileSub: {
    marginTop: 4,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  editBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  editBtnText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 12,
  },
  bmiCard: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  bmiTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bmiValue: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: "800",
  },
  bmiCategory: {
    fontSize: 13,
    fontWeight: "600",
  },
  formCard: {
    borderRadius: 14,
    padding: 14,
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
  readOnly: {
    opacity: 0.8,
  },
  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  twoCol: {
    width: "48.5%",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  optionBtn: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 14,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
