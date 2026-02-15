// components/firebaseConfig.js
import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZMJoJT-igP3LqzVUE7d7mk25w1m-h0qk",
  authDomain: "wellnessmate-ca893.firebaseapp.com",
  projectId: "wellnessmate-ca893",
  storageBucket: "wellnessmate-ca893.appspot.com",
  messagingSenderId: "626240324591",
  appId: "1:626240324591:web:5904ace80d53a5600fac1a",
  measurementId: "G-S31NLGHP3N",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export default firebase;
