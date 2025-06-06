const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log("[StoryEditor]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error("[StoryEditor]", ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info("[StoryEditor]", ...args);
    }
  },
};
