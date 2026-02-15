// components/firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZMJoJT-igP3LqzVUE7d7mk25w1m-h0qk",
  authDomain: "wellnessmate-ca893.firebaseapp.com",
  projectId: "wellnessmate-ca893",
  storageBucket: "wellnessmate-ca893.appspot.com",
  messagingSenderId: "626240324591",
  appId: "1:626240324591:web:5904ace80d53a5600fac1a",
  measurementId: "G-S31NLGHP3N",
};

const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const firestore = app.firestore();
export default firebase;
