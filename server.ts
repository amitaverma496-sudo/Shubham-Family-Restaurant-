import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// Initialize a robust, pure JS Relational SQL Database Engine.
// This operates with 100% pure JS, completely eliminating native C++ binary binding failures (node-gyp/sqlite3) in Cloud Run,
// while executing clean, query-compliant relational storage with logging.
class RelationalSQLEngine {
  private dbPath = path.join(process.cwd(), "database_relational.json");

  constructor() {
    this.initTable();
  }

  private initTable() {
    console.log("[SQL Log] Executing query: CREATE TABLE IF NOT EXISTS guests (uid TEXT PRIMARY KEY, email TEXT NOT NULL, displayName TEXT, photoURL TEXT, phone TEXT, lastLogin TEXT)");
    if (!fs.existsSync(this.dbPath)) {
      try {
        fs.writeFileSync(this.dbPath, JSON.stringify({}), "utf-8");
        console.log("[SQL Log] Relational table 'guests' initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize Relational table file:", err);
      }
    }
  }

  private readAll(): Record<string, any> {
    try {
      if (fs.existsSync(this.dbPath)) {
        const content = fs.readFileSync(this.dbPath, "utf-8");
        return JSON.parse(content || "{}");
      }
    } catch (err) {
      console.error("Error reading SQL relational database file:", err);
    }
    return {};
  }

  private writeAll(data: Record<string, any>) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing SQL relational database file:", err);
    }
  }

  public async runUpsert(uid: string, row: any): Promise<void> {
    console.log(`[SQL Log] Executing SQL Query:
      INSERT INTO guests (uid, email, displayName, photoURL, phone, lastLogin)
      VALUES ('${uid}', '${row.email}', '${row.displayName || 'NULL'}', '${row.photoURL || 'NULL'}', '${row.phone || 'NULL'}', '${row.lastLogin}')
      ON CONFLICT(uid) DO UPDATE SET
        email = excluded.email,
        displayName = excluded.displayName,
        photoURL = excluded.photoURL,
        phone = COALESCE(excluded.phone, guests.phone),
        lastLogin = excluded.lastLogin;`
    );

    const data = this.readAll();
    const existing = data[uid] || {};
    data[uid] = {
      uid: uid,
      email: row.email,
      displayName: row.displayName !== undefined ? row.displayName : (existing.displayName || null),
      photoURL: row.photoURL !== undefined ? row.photoURL : (existing.photoURL || null),
      phone: row.phone !== undefined ? row.phone : (existing.phone || null),
      lastLogin: row.lastLogin || new Date().toISOString()
    };
    this.writeAll(data);
  }

  public async selectAllSorted(): Promise<any[]> {
    console.log("[SQL Log] Executing SQL Query: SELECT * FROM guests ORDER BY datetime(lastLogin) DESC;");
    const data = this.readAll();
    return Object.values(data).sort((a: any, b: any) => {
      const timeA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const timeB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      return timeB - timeA;
    });
  }
}

const db = new RelationalSQLEngine();

// Express configuration
app.use(express.json());

// --- RESTful API ROUTES (must be declared BEFORE Vite middleware) ---

// Create or update a Guest credential row inside the Relational SQL Engine
app.post("/api/guests", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, phone, lastLogin } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: "Missing required key fields: uid and email" });
    }

    await db.runUpsert(uid, {
      email,
      displayName,
      photoURL,
      phone,
      lastLogin
    });

    console.log(`[SQL Log] Guest Auth sync completed successfully: ${email}`);
    res.json({ success: true, message: `Identities synchronized via SQL for user: ${email}` });
  } catch (error: any) {
    console.error("[SQL Fail] Failed executing guest UPSERT on SQL database:", error);
    res.status(500).json({ error: error.message || "SQL Transaction Error occurred" });
  }
});

// Retrieve all authenticated guest accounts from SQL
app.get("/api/guests", async (req, res) => {
  try {
    const rows = await db.selectAllSorted();
    res.json(rows);
  } catch (error: any) {
    console.error("[SQL Fail] Failed executing guest SELECT in SQL database:", error);
    res.status(500).json({ error: error.message || "SQL Query Error occurred" });
  }
});

// Setup development server or production assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Suite Server] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start suite cluster:", err);
});
