'use server';
/**
 * @fileOverview Generates a single story starting line based on a given image and theme.
 *
 * - generateStoryStartingLines - A function that generates a story starting line.
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
  startingLine: z
    .string()
    .describe('A single captivating starting line for the story.'),
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
  prompt: `You are a creative writing assistant. Generate one captivating starting line for a story based on the image and theme provided.

Theme: {{{theme}}}
Image: {{media url=imageDataUri}}

Ensure that the starting line is engaging to spark the user's imagination. Return the single starting line as a string within the 'startingLine' field of a JSON object.`,
});

const generateStoryStartingLinesFlow = ai.defineFlow(
  {
    name: 'generateStoryStartingLinesFlow',
    inputSchema: GenerateStoryStartingLinesInputSchema,
    outputSchema: GenerateStoryStartingLinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The model should directly return an object matching GenerateStoryStartingLinesOutputSchema
    // So, if output is not null, it should have a startingLine property.
    if (!output || typeof output.startingLine !== 'string') {
      throw new Error('AI model did not return a valid starting line.');
    }
    return output; 
  }
);
