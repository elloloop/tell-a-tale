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
    generate: jest
      .fn()
      .mockResolvedValue({ media: { url: "data:image/png;base64,abc" } }),
    defineFlow: (...args: any[]) => args[1],
  },
}));

import { generateChallengeImage } from "../generate-challenge-image-flow";

describe("generateChallengeImage", () => {
  it("returns a valid imageDataUri", async () => {
    const input = { hint: "dragon castle" };
    const result = await generateChallengeImage(input);
    expect(result).toEqual({ imageDataUri: "data:image/png;base64,abc" });
  });

  it("throws if media is missing", async () => {
    const { ai } = require("@/ai/genkit");
    ai.generate.mockResolvedValueOnce({});
    await expect(
      generateChallengeImage({ hint: "dragon castle" })
    ).rejects.toThrow(
      "Image generation failed to return a valid media object."
    );
  });
});
