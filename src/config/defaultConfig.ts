export interface AppConfig {
  persona: {
    name: string;
    gender: "male" | "female";
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
  locale: "ar-EG",
  quietHours: {
    start: "23:00",
    end: "08:00",
  },
  weeklyDaysOff: ["fri"],
};
