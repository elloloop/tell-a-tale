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
  try {
    // Create a batch write
    const batch = db.batch();

    // Create a new document reference
    const docRef = db.collection("stories").doc();

    // Prepare the data with explicit type conversions and sanitization
    const storyData = {
      text: story.text ? story.text.slice(0, 1000000) : "",
      createdAt:
        typeof story.createdAt === "number" ? story.createdAt : Date.now(),
      reactions: story.reactions
        ? Object.fromEntries(
            Object.entries(story.reactions).map(([k, v]) => [k, Number(v)])
          )
        : {},
      title: story.title ? story.title.slice(0, 1000) : "",
      dailyImageSrc: story.dailyImageSrc || "",
      theme: story.theme || "",
      username: story.username || "",
    };

    // Log the sanitized data
    console.log("Saving story data:", {
      textLength: storyData.text.length,
      createdAt: storyData.createdAt,
      reactionsCount: Object.keys(storyData.reactions).length,
      titleLength: storyData.title.length,
      hasImage: !!storyData.dailyImageSrc,
      hasTheme: !!storyData.theme,
      hasUsername: !!storyData.username,
    });

    // Add the document to the batch
    batch.set(docRef, storyData);

    // Commit the batch
    await batch.commit();

    return docRef.id;
  } catch (error) {
    console.error("Error saving story to database:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      storyId: story.id,
      textLength: story.text?.length,
    });
    throw new Error(
      `Failed to save story to database: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
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
