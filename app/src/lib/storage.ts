export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  set(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* blocked in private mode */ }
  }
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* blocked */ }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
