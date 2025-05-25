// moderate-story.ts
'use server';

/**
 * @fileOverview A story moderation AI agent.
 *
 * - moderateStory - A function that moderates a story.
 * - ModerateStoryInput - The input type for the moderateStory function.
 * - ModerateStoryOutput - The return type for the moderateStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateStoryInputSchema = z.object({
  story: z.string().describe('The story to moderate.'),
});
export type ModerateStoryInput = z.infer<typeof ModerateStoryInputSchema>;

const ModerateStoryOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the story is safe for all users.'),
  reason: z.string().describe('The reason why the story is not safe, if applicable.'),
});
export type ModerateStoryOutput = z.infer<typeof ModerateStoryOutputSchema>;

export async function moderateStory(input: ModerateStoryInput): Promise<ModerateStoryOutput> {
  return moderateStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateStoryPrompt',
  input: {schema: ModerateStoryInputSchema},
  output: {schema: ModerateStoryOutputSchema},
  prompt: `You are a content moderation expert. Your job is to determine if a given story is safe for all users.

Story: {{{story}}}

Determine if the story is safe for all users. If it is not safe, explain why.

Respond in JSON format.`,
});

const moderateStoryFlow = ai.defineFlow(
  {
    name: 'moderateStoryFlow',
    inputSchema: ModerateStoryInputSchema,
    outputSchema: ModerateStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
