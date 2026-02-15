import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { firestore, auth } from "./firebaseConfig"; // Only Firestore
import AnimatedButton from "./AnimatedButton";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen({ goBack }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [diet, setDiet] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null); // local URI only
  const [editable, setEditable] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    firestore
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setName(data.name || "");
          setWeight(data.weight || "");
          setHeight(data.height || "");
          setDiet(data.diet || "");
          setGender(data.gender || "");
          setPhoto(data.photo || null); // only local URI or saved string
        }
      })
      .catch((err) => console.log(err));
  }, [uid]);

  // Pick image from gallery (local URI only)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showModal = (message, success = true) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const handleSave = async () => {
    if (!name || !weight || !height || !diet || !gender) {
      return showModal("Please fill all fields", false);
    }

    try {
      // Save all data in Firestore collection only
      await firestore
        .collection("users")
        .doc(uid)
        .set(
          { name, weight, height, diet, gender, photo }, // store local URI or null
          { merge: true }
        );

      showModal("Profile saved!");
      setEditable(false);
    } catch (err) {
      showModal(err.message, false);
      console.log("Error saving profile:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={28} color="#4CAF50" />
      </TouchableOpacity>

      <View style={styles.header}>
        <TouchableOpacity onPress={editable ? pickImage : null}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.profilePic} />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color="#4CAF50" />
          )}
        </TouchableOpacity>
        <Text style={styles.title}>{name || "My Profile"}</Text>
        {!editable && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditable(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={[styles.input, !editable && styles.readOnly]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          editable={editable}
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={[styles.input, !editable && styles.readOnly]}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter your weight"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={editable}
        />

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={[styles.input, !editable && styles.readOnly]}
          value={height}
          onChangeText={setHeight}
          placeholder="Enter your height"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={editable}
        />

        <Text style={styles.label}>Diet Preference</Text>
        <View style={styles.optionContainer}>
          {["Vegetable", "Meat", "Balance"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                diet === option && styles.optionSelected,
                !editable && styles.readOnlyOption,
              ]}
              onPress={() => editable && setDiet(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  diet === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.optionContainer}>
          {["Male", "Female"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                gender === option && styles.optionSelected,
                !editable && styles.readOnlyOption,
              ]}
              onPress={() => editable && setGender(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {editable && (
        <AnimatedButton style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </AnimatedButton>
      )}

      {/* Custom Alert Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { borderColor: modalSuccess ? "#4CAF50" : "#f87171" },
            ]}
          >
            <Text
              style={[
                styles.modalMessage,
                { color: modalSuccess ? "#4CAF50" : "#f87171" },
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#0A0A0A",
    paddingTop: 40,
  },
  backButton: {
    marginTop: 15,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  label: {
    color: "#bbb",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#fff",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  readOnly: {
    opacity: 0.7,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#4CAF50",
  },
  readOnlyOption: {
    opacity: 0.6,
  },
  optionText: {
    color: "#fff",
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 25,
    alignSelf: "center",
    width: "60%",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#1C1C1C",
    borderWidth: 2,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});
