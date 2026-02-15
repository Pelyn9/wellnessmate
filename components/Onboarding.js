import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { firestore, auth } from "./firebaseConfig";

export default function OnboardingScreen({ user, onFinish }) {
  const [step, setStep] = useState(1);
  const [weight,setWeight] = useState("");
  const [height,setHeight] = useState("");
  const [workout,setWorkout] = useState("");
  const [diet,setDiet] = useState("");

  const next = async ()=>{
    if(step===1&&!weight) return Alert.alert("Error","Enter your weight");
    if(step===2&&!height) return Alert.alert("Error","Enter your height");
    if(step===3&&!workout) return Alert.alert("Error","Enter workout times");
    if(step===4&&!diet) return Alert.alert("Error","Choose diet");
    if(step<4){setStep(step+1);} else{
      await firestore.collection("users").doc(user.uid).update({weight,height,workout,diet});
      onFinish();
    }
  };

  const renderStep = () => {
    switch(step){
      case 1: return <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} />;
      case 2: return <TextInput style={styles.input} placeholder="Height (cm)" keyboardType="numeric" value={height} onChangeText={setHeight} />;
      case 3: return <TextInput style={styles.input} placeholder="Workout times per week" keyboardType="numeric" value={workout} onChangeText={setWorkout} />;
      case 4: return (
        <View>
          <TouchableOpacity style={[styles.option,diet==="Veg"&&styles.selected]} onPress={()=>setDiet("Veg")}><Text style={styles.optionText}>Vegetarian</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.option,diet==="Meat"&&styles.selected]} onPress={()=>setDiet("Meat")}><Text style={styles.optionText}>Meat</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.option,diet==="Balance"&&styles.selected]} onPress={()=>setDiet("Balance")}><Text style={styles.optionText}>Balanced</Text></TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step {step}/4</Text>
      {renderStep()}
      <TouchableOpacity style={styles.button} onPress={next}><Text style={styles.buttonText}>{step<4?"Next":"Finish"}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, justifyContent:"center", alignItems:"center", padding:20, backgroundColor:"#121212"},
  title:{color:"#4CAF50", fontSize:22, marginBottom:20},
  input:{width:"100%", backgroundColor:"#1E1E1E", color:"#fff", padding:15, borderRadius:12, marginVertical:8},
  button:{width:"100%", backgroundColor:"#4CAF50", padding:15, borderRadius:12, marginTop:20},
  buttonText:{color:"#fff", textAlign:"center", fontWeight:"bold", fontSize:16},
  option:{padding:15, borderWidth:1, borderColor:"#4CAF50", borderRadius:12, marginVertical:6},
  selected:{backgroundColor:"#4CAF50"},
  optionText:{color:"#fff", fontWeight:"bold", textAlign:"center"}
});
