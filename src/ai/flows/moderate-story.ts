
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
  isSafe: z.boolean().describe('Whether the story is safe for all users and not spam/gibberish.'),
  reason: z.string().describe('The reason why the story is not safe (e.g., inappropriate content, spam, gibberish), if applicable.'),
});
export type ModerateStoryOutput = z.infer<typeof ModerateStoryOutputSchema>;

export async function moderateStory(input: ModerateStoryInput): Promise<ModerateStoryOutput> {
  return moderateStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateStoryPrompt',
  input: {schema: ModerateStoryInputSchema},
  output: {schema: ModerateStoryOutputSchema},
  prompt: `You are a content moderation expert. Your job is to determine if a given story is safe and appropriate for all users.
This includes checking for:
- Inappropriate content (violence, hate speech, adult themes).
- Spam (e.g., repetitive characters or phrases, irrelevant links, nonsensical content designed to fill space, overly promotional text).
- Gibberish (e.g., random strings of characters, lack of coherent sentences or meaning).

Story:
{{{story}}}

Analyze the story based on the criteria above.
If the story is inappropriate, spam, or gibberish, set 'isSafe' to false and provide a concise reason in the 'reason' field.
If the story is safe and not spam/gibberish, set 'isSafe' to true and the 'reason' field can be an empty string or a brief confirmation (e.g., "Content appears safe.").

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

