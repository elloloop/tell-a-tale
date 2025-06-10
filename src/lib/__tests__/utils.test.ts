import { cn } from "../utils";

// Mock the dependencies
jest.mock("clsx", () => ({
  clsx: (...args: unknown[]) => args.join(" "),
}));

jest.mock("tailwind-merge", () => ({
  twMerge: (className: string) => className,
}));

describe("Utils", () => {
  describe("cn function", () => {
    it("should combine class names", () => {
      const result = cn("class1", "class2");
      expect(result).toBeTruthy();
    });

    it("should handle conditional classes", () => {
      const result = cn("base", true && "included", false && "excluded");
      expect(result).toContain("base");
      expect(result).toContain("included");
      expect(result).not.toContain("excluded");
    });
  });
});
