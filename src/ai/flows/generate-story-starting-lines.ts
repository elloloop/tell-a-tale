'use server';
/**
 * @fileOverview Generates story starting lines based on a given image and theme.
 *
 * - generateStoryStartingLines - A function that generates story starting lines.
 * - GenerateStoryStartingLinesInput - The input type for the generateStoryStartingLines function.
 * - GenerateStoryStartingLinesOutput - The return type for the generateStoryStartingLines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryStartingLinesInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo to inspire the story, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  theme: z.string().describe('The theme of the story.'),
});
export type GenerateStoryStartingLinesInput = z.infer<
  typeof GenerateStoryStartingLinesInputSchema
>;

const GenerateStoryStartingLinesOutputSchema = z.object({
  startingLines: z
    .array(z.string())
    .describe('An array of story starting lines.'),
});
export type GenerateStoryStartingLinesOutput = z.infer<
  typeof GenerateStoryStartingLinesOutputSchema
>;

export async function generateStoryStartingLines(
  input: GenerateStoryStartingLinesInput
): Promise<GenerateStoryStartingLinesOutput> {
  return generateStoryStartingLinesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryStartingLinesPrompt',
  input: {schema: GenerateStoryStartingLinesInputSchema},
  output: {schema: GenerateStoryStartingLinesOutputSchema},
  prompt: `You are a creative writing assistant. Generate 3 different starting lines for a story based on the image and theme provided.

Theme: {{{theme}}}
Image: {{media url=imageDataUri}}

Ensure that the starting lines are diverse and engaging to spark the user's imagination. Return only an array of strings.`,
});

const generateStoryStartingLinesFlow = ai.defineFlow(
  {
    name: 'generateStoryStartingLinesFlow',
    inputSchema: GenerateStoryStartingLinesInputSchema,
    outputSchema: GenerateStoryStartingLinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
