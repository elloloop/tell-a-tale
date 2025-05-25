export interface Story {
  id: string;
  text: string;
  createdAt: number;
  reactions: { [emoji: string]: number };
  title?: string; // Optional title, could be first few words
  dailyImageSrc: string; // Store which image it was based on
  theme: string; // Store the theme
}

export interface DailyChallengeData {
  imageSrc: string;
  imageAiHint: string;
  theme: string;
  storyStarters: {
    beginning: string[];
    middle: string[];
  };
}

export interface SharedStoryPayload {
  title?: string;
  teaser: string;
  fullStoryEnc: string; // Encoded full story
  dailyImageSrc: string;
  dailyImageHint: string;
  theme: string;
}
