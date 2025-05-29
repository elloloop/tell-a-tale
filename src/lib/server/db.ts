import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, DocumentData } from "firebase-admin/firestore";
import type { Story } from "@/lib/types";

// Initialize Firebase Admin for server-side operations
const apps = getApps();
const app =
  apps.length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : apps[0];

export const db = getFirestore(app);

export async function saveStoryToDb(story: Story) {
  const docRef = await db.collection("stories").add(story);
  return docRef.id;
}

export async function fetchAllStories() {
  const storiesQuery = db.collection("stories").orderBy("createdAt", "desc");
  const querySnapshot = await storiesQuery.get();
  return querySnapshot.docs.map((doc: DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// New function to check if a username is already taken
export async function isUsernameTaken(username: string): Promise<boolean> {
  const querySnapshot = await db
    .collection("users")
    .where("username", "==", username)
    .get();
  return !querySnapshot.empty;
}

// New function to fetch stories by username
export async function fetchStoriesByUsername(username: string) {
  const querySnapshot = await db
    .collection("stories")
    .where("username", "==", username)
    .orderBy("createdAt", "desc")
    .get();
  return querySnapshot.docs.map((doc: DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
