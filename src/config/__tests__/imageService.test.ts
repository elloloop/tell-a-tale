import { imageServiceConfig } from "../imageService";

describe("Image Service Config", () => {
  it("should have proper width and height values", () => {
    expect(imageServiceConfig.width).toBe(800);
    expect(imageServiceConfig.height).toBe(400);
  });

  it("should generate correct image URL with date", () => {
    const date = "2023-01-01";
    const url = imageServiceConfig.getImageUrl(date);
    expect(url).toContain(date);
    expect(url).toContain("800/400");
  });
});
