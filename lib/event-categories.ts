export const EVENT_CATEGORIES = [
    "MUSIC",
    "NIGHTLIFE",
    "ARTS",
    "HOLIDAYS",
    "DATING",
    "HOBBIES",
    "BUSINESS",
    "FOOD_DRINK",
    "TECH",
  ] as const;
  
  export type EventCategoryValue = (typeof EVENT_CATEGORIES)[number];
  
  export const CATEGORY_LABELS: Record<EventCategoryValue, string> = {
    MUSIC: "Music",
    NIGHTLIFE: "Nightlife",
    ARTS: "Performing & Visual Arts",
    HOLIDAYS: "Holidays",
    DATING: "Dating",
    HOBBIES: "Hobbies",
    BUSINESS: "Business",
    FOOD_DRINK: "Food & Drink",
    TECH: "Tech",
  };