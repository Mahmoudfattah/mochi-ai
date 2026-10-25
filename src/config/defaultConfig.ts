export interface AppConfig {
  persona: {
    name: string;
    gender: "male" | "female";
  };
  accessibility: {
    characterLabel: string;
  };
  locale: string;
  quietHours: {
    start: string;
    end: string;
  };
  weeklyDaysOff: string[];
}

export const defaultConfig: AppConfig = {
  persona: {
    name: "Mochi",
    gender: "male",
  },
  accessibility: {
    characterLabel: "موتشي",
  },
  locale: "ar-EG",
  quietHours: {
    start: "23:00",
    end: "08:00",
  },
  weeklyDaysOff: ["fri"],
};
