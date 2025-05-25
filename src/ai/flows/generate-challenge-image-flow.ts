
'use server';
/**
 * @fileOverview Generates a challenge image based on a hint.
 *
 * - generateChallengeImage - A function that generates an image for the daily challenge.
 * - GenerateChallengeImageInput - The input type for the generateChallengeImage function.
 * - GenerateChallengeImageOutput - The return type for the generateChallengeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChallengeImageInputSchema = z.object({
  hint: z.string().describe("Keywords describing the desired image content, e.g., 'dragon prince castle'."),
});
export type GenerateChallengeImageInput = z.infer<typeof GenerateChallengeImageInputSchema>;

const GenerateChallengeImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated image as a data URI (e.g., data:image/png;base64,...).'),
});
export type GenerateChallengeImageOutput = z.infer<typeof GenerateChallengeImageOutputSchema>;

export async function generateChallengeImage(
  input: GenerateChallengeImageInput
): Promise<GenerateChallengeImageOutput> {
  return generateChallengeImageFlow(input);
}

const generateChallengeImageFlow = ai.defineFlow(
  {
    name: 'generateChallengeImageFlow',
    inputSchema: GenerateChallengeImageInputSchema,
    outputSchema: GenerateChallengeImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: `A kid-friendly, storybook-style illustration. Subject: ${input.hint}. Style: whimsical, enchanting, detailed, vibrant colors, suitable for a children's story cover.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include IMAGE
         safetySettings: [ // Add safety settings to allow broader content generation
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to return a valid media object.');
    }
    // The model might return a WebP, ensure it's PNG if possible or handle as is.
    // For simplicity, we assume the data URI is directly usable.
    return { imageDataUri: media.url };
  }
);
