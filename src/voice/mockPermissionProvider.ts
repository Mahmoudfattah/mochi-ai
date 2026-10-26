import type { PermissionProvider, PermissionStatus } from "./providers";

export const MOCK_PERMISSION_STORAGE_KEY = "demo_permission_status";

export class MockPermissionProvider implements PermissionProvider {
  private status: PermissionStatus = this.readStatus();
  private readonly listeners = new Set<(status: PermissionStatus) => void>();

  async query(): Promise<PermissionStatus> {
    return this.status;
  }

  async request(): Promise<PermissionStatus> {
    return this.status;
  }

  onChange(listener: (status: PermissionStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  grant(): void {
    this.setStatus("granted");
  }

  deny(): void {
    this.setStatus("denied");
  }

  revoke(): void {
    this.setStatus("denied");
  }

  private setStatus(status: PermissionStatus): void {
    this.status = status;
    try {
      if (status === "unknown") {
        globalThis.localStorage.removeItem(MOCK_PERMISSION_STORAGE_KEY);
      } else {
        globalThis.localStorage.setItem(MOCK_PERMISSION_STORAGE_KEY, status);
      }
    } catch (error) {
      console.warn("Unable to persist mock permission status.", error);
    }
    this.listeners.forEach((listener) => listener(status));
  }

  private readStatus(): PermissionStatus {
    try {
      const storedStatus = globalThis.localStorage.getItem(
        MOCK_PERMISSION_STORAGE_KEY,
      );
      return storedStatus === "granted" || storedStatus === "denied"
        ? storedStatus
        : "unknown";
    } catch (error) {
      console.warn("Unable to read mock permission status.", error);
      return "unknown";
    }
  }
}
