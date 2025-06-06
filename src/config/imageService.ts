export const imageServiceConfig = {
  baseUrl: (() => {
    if (typeof window !== "undefined") {
      const storedUrl = window.localStorage.getItem("imageServiceUrl");
      if (storedUrl) return storedUrl;
    }
    return process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || "https://picsum.photos";
  })(),
  width: 800,
  height: 400,
  getImageUrl: (date: string) => {
    return `${imageServiceConfig.baseUrl}/${imageServiceConfig.width}/${imageServiceConfig.height}?date=${date}`;
  },
};
