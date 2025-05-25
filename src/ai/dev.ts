import { config } from 'dotenv';
config();

import '@/ai/flows/generate-story-starting-lines.ts';
import '@/ai/flows/moderate-story.ts';