import { z } from "zod";

// List of adjectives and nouns for generating usernames
const adjectives = [
  "Happy",
  "Brave",
  "Clever",
  "Kind",
  "Wise",
  "Funny",
  "Sunny",
  "Lucky",
  "Mighty",
  "Swift",
  "Bright",
  "Calm",
  "Gentle",
  "Noble",
  "Proud",
  "Magic",
  "Fancy",
  "Witty",
  "Jolly",
  "Daring",
  "Keen",
  "Merry",
  "Quick",
  "Vibrant",
  "Zealous",
  "Cheerful",
  "Friendly",
  "Honest",
  "Lively",
  "Peaceful",
];

const nouns = [
  "Dragon",
  "Knight",
  "Wizard",
  "Unicorn",
  "Tiger",
  "Eagle",
  "Lion",
  "Wolf",
  "Dolphin",
  "Panda",
  "Fox",
  "Turtle",
  "Penguin",
  "Koala",
  "Owl",
  "Phoenix",
  "Hero",
  "Explorer",
  "Dreamer",
  "Voyager",
  "Pioneer",
  "Artist",
  "Writer",
  "Reader",
  "Captain",
  "Sailor",
  "Pilot",
  "Scholar",
  "Inventor",
  "Ranger",
];

// Username regex validation: letters, numbers, underscores, and hyphens
export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  );

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}

export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  const result = UsernameSchema.safeParse(username);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors[0]?.message || "Invalid username format",
    };
  }
  return { valid: true };
}
