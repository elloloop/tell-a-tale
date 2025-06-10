// Note: We're importing the type but not using the actual logger since we're using isolateModules
import type { logger as LoggerType } from "../logger";

describe("Logger", () => {
  // Store the original console methods and NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleInfo = console.info;

  beforeEach(() => {
    // Reset modules for each test
    jest.resetModules();

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("in development environment", () => {
    let devLogger: typeof LoggerType;

    beforeEach(() => {
      // Set NODE_ENV and get a fresh instance of the logger
      process.env.NODE_ENV = "development";
      jest.isolateModules(() => {
        // Using dynamic import for isolated modules
        devLogger = jest.requireActual("../logger").logger;
      });
    });

    it("should log messages in development mode", () => {
      devLogger.log("test log");
      expect(console.log).toHaveBeenCalledWith("[StoryEditor]", "test log");

      devLogger.error("test error");
      expect(console.error).toHaveBeenCalledWith("[StoryEditor]", "test error");

      devLogger.info("test info");
      expect(console.info).toHaveBeenCalledWith("[StoryEditor]", "test info");
    });

    it("should handle multiple arguments", () => {
      devLogger.log("message", { data: 123 }, ["array"]);
      expect(console.log).toHaveBeenCalledWith(
        "[StoryEditor]",
        "message",
        { data: 123 },
        ["array"]
      );
    });
  });

  describe("in production environment", () => {
    let prodLogger: typeof LoggerType;

    beforeEach(() => {
      // Set NODE_ENV and get a fresh instance of the logger
      process.env.NODE_ENV = "production";
      jest.isolateModules(() => {
        // Using dynamic import for isolated modules
        prodLogger = jest.requireActual("../logger").logger;
      });
    });

    it("should not log messages in production mode", () => {
      prodLogger.log("test log");
      expect(console.log).not.toHaveBeenCalled();

      prodLogger.error("test error");
      expect(console.error).not.toHaveBeenCalled();

      prodLogger.info("test info");
      expect(console.info).not.toHaveBeenCalled();
    });
  });
});
