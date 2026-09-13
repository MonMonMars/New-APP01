import type { Task } from "./types";

const STORAGE_KEY = "new-app01.tasks.v1";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore write failures (e.g. storage disabled); state stays in memory.
  }
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    (candidate.status === "todo" || candidate.status === "done") &&
    typeof candidate.createdAt === "number"
  );
}
