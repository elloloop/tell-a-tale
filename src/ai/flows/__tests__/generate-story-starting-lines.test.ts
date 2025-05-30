// Mock z from genkit
jest.mock("genkit", () => ({
  z: {
    object: jest.fn().mockReturnValue({}),
    string: jest.fn().mockReturnValue({
      describe: jest.fn().mockReturnThis(),
    }),
  },
}));

// Mock ai from @/ai/genkit
jest.mock("@/ai/genkit", () => ({
  ai: {
    definePrompt: jest.fn().mockReturnValue(async () => ({
      output: { startingLine: "Once upon a time..." },
    })),
    defineFlow: (...args: any[]) => args[1],
  },
}));

import { generateStoryStartingLines } from "../generate-story-starting-lines";

describe("generateStoryStartingLines", () => {
  it("returns a valid starting line", async () => {
    const input = {
      imageDataUri: "data:image/png;base64,abc",
      theme: "adventure",
    };
    const result = await generateStoryStartingLines(input);
    expect(result).toEqual({ startingLine: "Once upon a time..." });
  });

  it("throws if AI returns invalid output", async () => {
    jest.resetModules();
    const { ai } = require("@/ai/genkit");
    ai.definePrompt.mockReturnValueOnce(async () => ({ output: null }));
    const {
      generateStoryStartingLines,
    } = require("../generate-story-starting-lines");
    await expect(
      generateStoryStartingLines({
        imageDataUri: "data:image/png;base64,abc",
        theme: "adventure",
      })
    ).rejects.toThrow("AI model did not return a valid starting line.");
  });
});
