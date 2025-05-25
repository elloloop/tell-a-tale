
'use server';

import { generateStoryStartingLines as genLines, GenerateStoryStartingLinesInput, GenerateStoryStartingLinesOutput } from '@/ai/flows/generate-story-starting-lines';
import { moderateStory as modStory, ModerateStoryInput, ModerateStoryOutput } from '@/ai/flows/moderate-story';
import { generateChallengeImage as genChallengeImage, GenerateChallengeImageInput, GenerateChallengeImageOutput } from '@/ai/flows/generate-challenge-image-flow';
import { z } from 'zod';


export async function generatePrompts(input: GenerateStoryStartingLinesInput): Promise<GenerateStoryStartingLinesOutput | { error: string }> {
  try {
    const result = await genLines(input);
    if (!result || !result.startingLines) {
      return { error: "Failed to generate story lines. AI model returned unexpected data." };
    }
    return result;
  } catch (error) {
    console.error("Error in generatePrompts:", error);
    if (error instanceof z.ZodError) {
      return { error: `Invalid input: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { error: "An unexpected error occurred while generating story prompts." };
  }
}

export async function checkStorySafety(input: ModerateStoryInput): Promise<ModerateStoryOutput | { error: string }> {
  try {
    const result = await modStory(input);
    if (typeof result?.isSafe !== 'boolean') {
       return { error: "Failed to moderate story. AI model returned unexpected data." };
    }
    return result;
  } catch (error)
  {
    console.error("Error in checkStorySafety:", error);
    if (error instanceof z.ZodError) {
      return { error: `Invalid input for moderation: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { error: "An unexpected error occurred during story moderation." };
  }
}

export async function generateImageForChallenge(input: GenerateChallengeImageInput): Promise<GenerateChallengeImageOutput | { error: string }> {
  try {
    const result = await genChallengeImage(input);
    if (!result || !result.imageDataUri) {
      return { error: "Failed to generate image. AI model returned unexpected data." };
    }
    return result;
  } catch (error) {
    console.error("Error in generateImageForChallenge:", error);
    if (error instanceof z.ZodError) {
      return { error: `Invalid input for image generation: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { error: "An unexpected error occurred while generating the challenge image." };
  }
}
