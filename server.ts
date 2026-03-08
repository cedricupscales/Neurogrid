import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cockpit.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_active TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    deadline TEXT,
    domain TEXT,
    urgency INTEGER,
    importance INTEGER,
    duration INTEGER,
    quadrant TEXT,
    completed INTEGER DEFAULT 0,
    timeblockStart TEXT,
    timeblockEnd TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS xp_events (
    id TEXT PRIMARY KEY,
    amount INTEGER,
    reason TEXT,
    domain TEXT,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS skill_distribution (
    domain TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
  );
`);

// Seed initial user and skills if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (id, xp, level, streak) VALUES (?, ?, ?, ?)").run("default-user", 0, 1, 0);
  const domains = ["Physical", "Business", "Academic", "Social", "Personal", "Financial"];
  domains.forEach(d => {
    db.prepare("INSERT INTO skill_distribution (domain, value) VALUES (?, ?)").run(d, 0);
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/user", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get("default-user");
    const skills = db.prepare("SELECT * FROM skill_distribution").all();
    res.json({ ...user, skills: skills.reduce((acc: any, s: any) => ({ ...acc, [s.domain]: s.value }), {}) });
  });

  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY createdAt DESC").all();
    res.json(tasks.map((t: any) => ({ ...t, completed: !!t.completed })));
  });

  app.post("/api/tasks", (req, res) => {
    const task = req.body;
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, deadline, domain, urgency, importance, duration, quadrant, completed, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(task.id, task.title, task.description, task.deadline, task.domain, task.urgency, task.importance, task.duration, task.quadrant, task.completed ? 1 : 0, task.createdAt);
    res.json({ success: true });
  });

  app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const keys = Object.keys(updates);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = keys.map(k => k === 'completed' ? (updates[k] ? 1 : 0) : updates[k]);
    db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/xp", (req, res) => {
    const { amount, reason, domain } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    db.transaction(() => {
      db.prepare("INSERT INTO xp_events (id, amount, reason, domain, timestamp) VALUES (?, ?, ?, ?, ?)").run(id, amount, reason, domain, timestamp);
      db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(amount, "default-user");
      db.prepare("UPDATE skill_distribution SET value = value + ? WHERE domain = ?").run(amount, domain);
      
      // Level up logic (simple: 1000 XP per level)
      const user = db.prepare("SELECT xp FROM users WHERE id = ?").get("default-user") as { xp: number };
      const newLevel = Math.floor(user.xp / 1000) + 1;
      db.prepare("UPDATE users SET level = ? WHERE id = ?").run(newLevel, "default-user");
    })();
    
    res.json({ success: true });
  });

  app.get("/api/report", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks").all();
    const xpEvents = db.prepare("SELECT * FROM xp_events").all();
    res.json({ 
      tasks: tasks.map((t: any) => ({ ...t, completed: !!t.completed })), 
      xpEvents 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
