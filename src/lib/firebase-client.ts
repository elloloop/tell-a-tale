"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";

// Check if we're in development and should use mock Firebase
const useMockFirebase =
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  projectId: "elloloop-tell-a-tale",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
let app, auth: Auth, firestore: Firestore;

if (typeof window !== "undefined") {
  // Client-side initialization
  if (useMockFirebase) {
    console.warn(
      "Using mock Firebase implementation. Set up your Firebase configuration in .env.local for full functionality."
    );

    // Mock Firebase Auth
    auth = {
      currentUser: null,
      app: {} as any,
      name: "mock-auth",
      config: {} as any,
      onAuthStateChanged: (nextOrObserver, error, completed) => {
        if (typeof nextOrObserver === "function") {
          nextOrObserver(null);
        }
        return () => {};
      },
      signInAnonymously: async () => ({ user: { uid: "mock-user-id" } }),
      signOut: async () => {},
      setPersistence: async () => {},
      useDeviceLanguage: () => {},
      useEmulator: () => {},
      settings: {
        appVerificationDisabledForTesting: false,
      },
      languageCode: null,
      tenantId: null,
      beforeAuthStateChanged: () => () => {},
      onIdTokenChanged: () => () => {},
      authStateReady: async () => {},
      emulatorConfig: null,
      updateCurrentUser: async () => {},
    } as Auth;

    // Mock Firestore
    firestore = {
      type: "firestore",
      app: {} as any,
      toJSON: () => ({}),
      doc: () => ({
        get: async () => ({ exists: () => false, data: () => ({}) }),
        set: async () => {},
      }),
    } as Firestore;
  } else {
    // Initialize Firebase
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Connect to Firebase emulators in development if needed
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
    ) {
      try {
        // Connect to Firebase Auth emulator
        connectAuthEmulator(auth, "http://localhost:9099", {
          disableWarnings: true,
        });
        // Connect to Firestore emulator
        connectFirestoreEmulator(firestore, "localhost", 8080);
        console.log("Connected to Firebase emulators");
      } catch (error) {
        console.error("Failed to connect to Firebase emulators:", error);
      }
    }
  }
} else {
  // Server-side initialization
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  firestore = getFirestore(app);
}

export { app, auth, firestore };
