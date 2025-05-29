"use server";

import {
  generateStoryStartingLines as genLines,
  GenerateStoryStartingLinesInput,
  GenerateStoryStartingLinesOutput,
} from "@/ai/flows/generate-story-starting-lines";
import {
  moderateStory as modStory,
  ModerateStoryInput,
  ModerateStoryOutput,
} from "@/ai/flows/moderate-story";
import {
  generateChallengeImage as genChallengeImage,
  GenerateChallengeImageInput,
  GenerateChallengeImageOutput,
} from "@/ai/flows/generate-challenge-image-flow";
import { z } from "zod";
import {
  saveStoryToDb,
  fetchAllStories,
  isUsernameTaken,
  fetchStoriesByUsername,
} from "@/lib/server/db";
import type { Story } from "@/lib/types";

export async function generatePrompts(
  input: GenerateStoryStartingLinesInput
): Promise<GenerateStoryStartingLinesOutput | { error: string }> {
  try {
    const result = await genLines(input);
    if (!result || typeof result.startingLine !== "string") {
      return {
        error:
          "Failed to generate story line. AI model returned unexpected data.",
      };
    }
    return result;
  } catch (error) {
    console.error("Error in generatePrompts:", error);
    if (error instanceof z.ZodError) {
      return {
        error: `Invalid input: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      error: "An unexpected error occurred while generating story prompts.",
    };
  }
}

export async function checkStorySafety(
  input: ModerateStoryInput
): Promise<ModerateStoryOutput | { error: string }> {
  // Moderation temporarily disabled for development
  return {
    isSafe: true,
    reason: "",
  };
}

export async function generateImageForChallenge(
  input: GenerateChallengeImageInput
): Promise<GenerateChallengeImageOutput | { error: string }> {
  try {
    const result = await genChallengeImage(input);
    if (!result || !result.imageDataUri) {
      return {
        error: "Failed to generate image. AI model returned unexpected data.",
      };
    }
    return result;
  } catch (error) {
    console.error("Error in generateImageForChallenge:", error);
    if (error instanceof z.ZodError) {
      return {
        error: `Invalid input for image generation: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      error:
        "An unexpected error occurred while generating the challenge image.",
    };
  }
}

export async function submitStoryToServer(
  story: Story
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await saveStoryToDb(story);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllStories(): Promise<Story[]> {
  const docs = await fetchAllStories();
  // Map Firestore docs to Story type, providing defaults for missing fields
  return docs.map((doc: any) => ({
    id: doc.id,
    text: doc.text ?? "",
    createdAt: doc.createdAt ?? 0,
    reactions: doc.reactions ?? {},
    title: doc.title ?? "",
    dailyImageSrc: doc.dailyImageSrc ?? "",
    theme: doc.theme ?? "",
  })) as Story[];
}

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  try {
    const taken = await isUsernameTaken(username);
    return { available: !taken };
  } catch (error) {
    console.error("Error checking username availability:", error);
    // If there's an error, assume it's not available to be safe
    return { available: false };
  }
}

export async function getUserStories(username: string): Promise<Story[]> {
  try {
    const docs = await fetchStoriesByUsername(username);
    return docs.map((doc: any) => ({
      id: doc.id,
      text: doc.text ?? "",
      createdAt: doc.createdAt ?? 0,
      reactions: doc.reactions ?? {},
      title: doc.title ?? "",
      dailyImageSrc: doc.dailyImageSrc ?? "",
      theme: doc.theme ?? "",
      username: doc.username ?? "",
      userId: doc.userId ?? "",
    })) as Story[];
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return [];
  }
}
