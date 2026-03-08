import { Task, UserStats, XPEvent } from "../types";

export const fetchUser = async (): Promise<UserStats> => {
  const res = await fetch("/api/user");
  return res.json();
};

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch("/api/tasks");
  return res.json();
};

export const createTask = async (task: Task) => {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
};

export const deleteTask = async (id: string) => {
  await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
};

export const addXP = async (amount: number, reason: string, domain: string) => {
  await fetch("/api/xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reason, domain }),
  });
};

export const fetchReport = async () => {
  const res = await fetch("/api/report");
  return res.json();
};
