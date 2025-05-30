// Mock z from genkit
jest.mock("genkit", () => ({
  z: {
    object: jest.fn().mockReturnValue({}),
    string: jest.fn().mockReturnValue({
      describe: jest.fn().mockReturnThis(),
    }),
    boolean: jest.fn().mockReturnValue({
      describe: jest.fn().mockReturnThis(),
    }),
  },
}));

// Mock ai from @/ai/genkit
jest.mock("@/ai/genkit", () => ({
  ai: {
    definePrompt: jest.fn().mockReturnValue(async () => ({
      output: { isSafe: true, reason: "" },
    })),
    defineFlow: (...args: any[]) => args[1],
  },
}));

import { moderateStory } from "../moderate-story";

describe("moderateStory", () => {
  it("returns moderation result", async () => {
    const input = { story: "A safe story." };
    const result = await moderateStory(input);
    expect(result).toEqual({ isSafe: true, reason: "" });
  });

  it("throws if AI returns invalid output", async () => {
    jest.resetModules();
    const { ai } = require("@/ai/genkit");
    ai.definePrompt.mockReturnValueOnce(async () => ({ output: null }));
    const { moderateStory } = require("../moderate-story");
    await expect(moderateStory({ story: "bad" })).rejects.toThrow();
  });
});
