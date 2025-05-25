'use server';

import { generateStoryStartingLines as genLines, GenerateStoryStartingLinesInput, GenerateStoryStartingLinesOutput } from '@/ai/flows/generate-story-starting-lines';
import { moderateStory as modStory, ModerateStoryInput, ModerateStoryOutput } from '@/ai/flows/moderate-story';
import { z } from 'zod';


export async function generatePrompts(input: GenerateStoryStartingLinesInput): Promise<GenerateStoryStartingLinesOutput | { error: string }> {
  try {
    // Validate input if not already done by Genkit (Genkit usually does)
    // For GenerateStoryStartingLinesInput, imageDataUri and theme are required.
    // The Genkit flow already defines this with Zod.
    const result = await genLines(input);
    if (!result || !result.startingLines) {
      // Genkit flows should return the defined output schema or throw.
      // This check is an additional safeguard.
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
     // Validate input if not already done by Genkit
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
