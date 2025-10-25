import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Debug environment variables
console.log("Firebase API Key from env:", import.meta.env.VITE_FIREBASE_API_KEY);

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interview-app-7fba4.firebaseapp.com",
  projectId: "interview-app-7fba4",
  storageBucket: "interview-app-7fba4.firebasestorage.app",
  messagingSenderId: "11394759670",
  appId: "1:11394759670:web:be81eaa97a616fdb0925d7",
  measurementId: "G-7ZFJKSCB1T"
};

// Initialize Firebase only if API key is available
let app;
let firestore;
let analytics;

try {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.warn("Firebase API key is missing. Firebase features will be disabled.");
  } else {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    
    // Only initialize analytics in production or if needed
    if (import.meta.env.PROD) {
      analytics = getAnalytics(app);
    }
    
    console.log("Firebase initialized successfully");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Export Firebase instances (or null if not initialized)
export { app, firestore, analytics };

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