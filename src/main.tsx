import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

// !START FIREBASE
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "live-code-interviewer-sv.firebaseapp.com",
  projectId: "live-code-interviewer-sv",
  storageBucket: "live-code-interviewer-sv.appspot.com",
  messagingSenderId: "801834174909",
  appId: "1:801834174909:web:33da1136e14a901f862ad4",
  measurementId: "G-75Z1VG7Z60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore();
export const analytics = getAnalytics(app);

console.warn("Firebase initialized");
// !END FIREBASE

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
