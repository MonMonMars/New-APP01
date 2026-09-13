import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Filter, Task } from "./types";
import { loadTasks, saveTasks } from "./storage";

const FILTERS: Filter[] = ["all", "todo", "done"];

function filterLabel(filter: Filter): string {
  switch (filter) {
    case "all":
      return "All";
    case "todo":
      return "Active";
    case "done":
      return "Done";
    default: {
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

function matchesFilter(task: Task, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "todo":
      return task.status === "todo";
    case "done":
      return task.status === "done";
    default: {
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const remaining = useMemo(
    () => tasks.filter((task) => task.status === "todo").length,
    [tasks],
  );

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => matchesFilter(task, filter))
        .sort((a, b) => b.createdAt - a.createdAt),
    [tasks, filter],
  );

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const task: Task = {
      id: createId(),
      title,
      status: "todo",
      createdAt: Date.now(),
    };
    setTasks((current) => [task, ...current]);
    setDraft("");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "done" ? "todo" : "done" }
          : task,
      ),
    );
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearDone() {
    setTasks((current) => current.filter((task) => task.status !== "done"));
  }

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              ✓
            </span>
            <div>
              <h1 className="brand__title">New-APP01</h1>
              <p className="brand__subtitle">A focused task board</p>
            </div>
          </div>
          <div className="counter" aria-live="polite">
            <span className="counter__value">{remaining}</span>
            <span className="counter__label">
              {remaining === 1 ? "task left" : "tasks left"}
            </span>
          </div>
        </header>

        <form className="composer" onSubmit={addTask}>
          <input
            className="composer__input"
            type="text"
            value={draft}
            placeholder="What needs doing?"
            aria-label="New task title"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="composer__button" type="submit">
            Add
          </button>
        </form>

        <div className="filters" role="tablist" aria-label="Filter tasks">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              className={
                filter === option ? "filter filter--active" : "filter"
              }
              onClick={() => setFilter(option)}
            >
              {filterLabel(option)}
            </button>
          ))}
          <button
            type="button"
            className="filter filter--ghost"
            onClick={clearDone}
          >
            Clear done
          </button>
        </div>

        <ul className="list">
          {visibleTasks.length === 0 ? (
            <li className="empty">Nothing here yet — add your first task.</li>
          ) : (
            visibleTasks.map((task) => (
              <li
                key={task.id}
                className={
                  task.status === "done" ? "task task--done" : "task"
                }
              >
                <label className="task__main">
                  <input
                    type="checkbox"
                    className="task__checkbox"
                    checked={task.status === "done"}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="task__title">{task.title}</span>
                </label>
                <button
                  type="button"
                  className="task__delete"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => removeTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <footer className="footnote">
        Data is saved locally in your browser.
      </footer>
    </div>
  );
}
