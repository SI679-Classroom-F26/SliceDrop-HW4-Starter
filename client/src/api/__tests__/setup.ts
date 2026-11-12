// GIVEN: runs before every test file. Node has no sessionStorage, so this
// is a small in-memory one -- emptied before every test, the way a fresh
// browser tab starts with nobody logged in.
import { afterEach, beforeEach, vi } from 'vitest';

class MemoryStorage {
  private items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, String(value));
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
  clear(): void {
    this.items.clear();
  }
}

vi.stubGlobal('sessionStorage', new MemoryStorage());

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
