export interface KeyValueStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export const ONBOARDING_STORAGE_KEY = "onboarding_completed";

export const localStorageAdapter: KeyValueStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn("Unable to read local storage.", error);
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Unable to write local storage.", error);
    }
  },
};
