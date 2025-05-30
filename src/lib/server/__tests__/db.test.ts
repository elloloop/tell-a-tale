import {
  db,
  saveStoryToDb,
  fetchAllStories,
  isUsernameTaken,
  fetchStoriesByUsername,
} from "../db";
import { Story } from "@/lib/types";
import type {
  WriteBatch,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";

// Mock Firebase Admin
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => {
  const mockBatch = {
    set: jest.fn(),
    commit: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as WriteBatch;

  const mockDoc = {
    id: "test-doc-id",
    data: jest.fn(() => ({})),
  };

  const mockQuerySnapshot = {
    empty: false,
    docs: [mockDoc],
  };

  const mockCollection = {
    id: "stories",
    parent: null,
    path: "stories",
    doc: jest.fn(() => ({
      id: "test-doc-id",
      set: jest.fn(),
    })),
    where: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
      })),
      get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    })),
    listDocuments: jest.fn(),
  } as unknown as CollectionReference<DocumentData>;

  return {
    getFirestore: jest.fn(() => ({
      batch: jest.fn(() => mockBatch),
      collection: jest.fn(() => mockCollection),
    })),
  };
});

describe("Database Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveStoryToDb", () => {
    it("should save a story successfully", async () => {
      const mockStory: Story = {
        id: "test-id",
        text: "Test story text",
        createdAt: Date.now(),
        reactions: { like: 1, love: 2 },
        title: "Test Title",
        dailyImageSrc: "test-image.jpg",
        theme: "test-theme",
        username: "testuser",
      };

      const result = await saveStoryToDb(mockStory);
      expect(result).toBe("test-doc-id");
    });

    it("should handle empty story fields", async () => {
      const mockStory: Story = {
        id: "test-id",
        text: "",
        createdAt: Date.now(),
        reactions: {},
        title: "",
        dailyImageSrc: "",
        theme: "",
        username: "",
      };

      const result = await saveStoryToDb(mockStory);
      expect(result).toBe("test-doc-id");
    });

    it("should handle errors gracefully", async () => {
      const mockStory: Story = {
        id: "test-id",
        text: "Test story text",
        createdAt: Date.now(),
        reactions: {},
        title: "Test Title",
        dailyImageSrc: "",
        theme: "",
        username: "",
      };

      // Mock an error in the batch commit
      const mockError = new Error("Test error");
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockRejectedValueOnce(mockError),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as unknown as WriteBatch;

      jest.spyOn(db, "batch").mockImplementationOnce(() => mockBatch);

      await expect(saveStoryToDb(mockStory)).rejects.toThrow(
        "Failed to save story to database: Test error"
      );
    });

    describe("saveStoryToDb edge cases", () => {
      it("should truncate text to 1,000,000 characters", async () => {
        const longText = "a".repeat(1_000_005);
        const mockStory: Story = {
          id: "test-id",
          text: longText,
          createdAt: Date.now(),
          reactions: {},
          title: "Test Title",
          dailyImageSrc: "",
          theme: "",
          username: "",
        };
        const result = await saveStoryToDb(mockStory);
        expect(result).toBe("test-doc-id");
      });

      it("should truncate title to 1,000 characters", async () => {
        const longTitle = "b".repeat(1_005);
        const mockStory: Story = {
          id: "test-id",
          text: "Test story text",
          createdAt: Date.now(),
          reactions: {},
          title: longTitle,
          dailyImageSrc: "",
          theme: "",
          username: "",
        };
        const result = await saveStoryToDb(mockStory);
        expect(result).toBe("test-doc-id");
      });

      it("should coerce non-numeric createdAt to current timestamp", async () => {
        const mockStory: Story = {
          id: "test-id",
          text: "Test story text",
          createdAt: "not-a-number" as any,
          reactions: {},
          title: "Test Title",
          dailyImageSrc: "",
          theme: "",
          username: "",
        };
        const result = await saveStoryToDb(mockStory);
        expect(result).toBe("test-doc-id");
      });

      it("should coerce all reaction values to numbers", async () => {
        const mockStory: Story = {
          id: "test-id",
          text: "Test story text",
          createdAt: Date.now(),
          reactions: { like: "5", love: "2" } as any,
          title: "Test Title",
          dailyImageSrc: "",
          theme: "",
          username: "",
        };
        const result = await saveStoryToDb(mockStory);
        expect(result).toBe("test-doc-id");
      });

      it("should handle missing/undefined fields gracefully", async () => {
        const mockStory = {
          id: "test-id",
        } as Story;
        const result = await saveStoryToDb(mockStory);
        expect(result).toBe("test-doc-id");
      });
    });
  });

  describe("fetchAllStories", () => {
    it("should fetch all stories", async () => {
      const stories = await fetchAllStories();
      expect(stories).toHaveLength(1);
      expect(stories[0]).toHaveProperty("id", "test-doc-id");
    });

    describe("fetchAllStories edge cases", () => {
      it("should return an empty array if there are no stories", async () => {
        // Mock empty query snapshot
        const mockQuerySnapshot = { empty: true, docs: [] };
        const mockCollection = {
          orderBy: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
          })),
        };
        jest
          .spyOn(db, "collection")
          .mockImplementationOnce(() => mockCollection as any);
        const stories = await fetchAllStories();
        expect(stories).toEqual([]);
      });
    });
  });

  describe("isUsernameTaken", () => {
    it("should return true when username is taken", async () => {
      const result = await isUsernameTaken("existinguser");
      expect(result).toBe(true);
    });

    it("should return false when username is not taken", async () => {
      // Mock empty query snapshot
      const mockCollection = {
        id: "users",
        parent: null,
        path: "users",
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValueOnce({ empty: true }),
        listDocuments: jest.fn(),
      } as unknown as CollectionReference<DocumentData>;

      jest.spyOn(db, "collection").mockImplementationOnce(() => mockCollection);

      const result = await isUsernameTaken("newuser");
      expect(result).toBe(false);
    });

    describe("isUsernameTaken edge cases", () => {
      it("should handle errors thrown by Firestore gracefully", async () => {
        const mockCollection = {
          where: jest.fn(() => ({
            get: jest.fn(() => Promise.reject(new Error("Firestore error"))),
          })),
        };
        jest
          .spyOn(db, "collection")
          .mockImplementationOnce(() => mockCollection as any);
        await expect(isUsernameTaken("erroruser")).rejects.toThrow(
          "Firestore error"
        );
      });
    });
  });

  describe("fetchStoriesByUsername", () => {
    it("should fetch stories for a specific username", async () => {
      const stories = await fetchStoriesByUsername("testuser");
      expect(stories).toHaveLength(1);
      expect(stories[0]).toHaveProperty("id", "test-doc-id");
    });

    describe("fetchStoriesByUsername edge cases", () => {
      it("should return an empty array if the user has no stories", async () => {
        const mockQuerySnapshot = { empty: true, docs: [] };
        const mockCollection = {
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
            })),
          })),
        };
        jest
          .spyOn(db, "collection")
          .mockImplementationOnce(() => mockCollection as any);
        const stories = await fetchStoriesByUsername("nouser");
        expect(stories).toEqual([]);
      });

      it("should handle errors thrown by Firestore gracefully", async () => {
        const mockCollection = {
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              get: jest.fn(() => Promise.reject(new Error("Firestore error"))),
            })),
          })),
        };
        jest
          .spyOn(db, "collection")
          .mockImplementationOnce(() => mockCollection as any);
        await expect(fetchStoriesByUsername("erroruser")).rejects.toThrow(
          "Firestore error"
        );
      });
    });
  });
});
