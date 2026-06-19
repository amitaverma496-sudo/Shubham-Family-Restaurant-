import express from "express";
import path from "path";
import { db } from "./src/db/index.ts";
import { guests } from "./src/db/schema.ts";
import { desc } from "drizzle-orm";

const app = express();
const PORT = 3000;

app.use(express.json());

// API route FIRST
app.post("/api/guests", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, phone, lastLogin } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const emailLower = email.trim().toLowerCase();
    const username = emailLower.split("@")[0];
    const uidClean = uid || `sql_guest_${username}`;
    const displayNameClean = displayName || (username.charAt(0).toUpperCase() + username.slice(1));
    const photoURLClean = photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailLower)}`;
    const phoneClean = phone ? phone.trim() : null;
    const loginTime = lastLogin ? new Date(lastLogin) : new Date();

    // Query layer error isolation
    try {
      await db.insert(guests)
        .values({
          uid: uidClean,
          email: emailLower,
          displayName: displayNameClean,
          photoURL: photoURLClean,
          phone: phoneClean,
          lastLogin: loginTime,
        })
        .onConflictDoUpdate({
          target: guests.email,
          set: {
            uid: uidClean,
            displayName: displayNameClean,
            photoURL: photoURLClean,
            phone: phoneClean,
            lastLogin: loginTime,
          }
        });
      
      console.log(`[SQL Log] Upserted guest row for: ${emailLower}`);
      res.json({ success: true, message: `Identity synchronized for: ${emailLower}` });
    } catch (queryErr: any) {
      console.error("Database upsert failure:", queryErr);
      throw new Error("Unable to save credentials to database.", { cause: queryErr });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "SQL Transaction Error occurred" });
  }
});

app.get("/api/guests", async (req, res) => {
  try {
    try {
      const rows = await db.select().from(guests).orderBy(desc(guests.createdAt));
      // Map columns from schema to expected frontend keys
      const mapped = rows.map((r) => ({
        uid: r.uid || `guest_${r.id}`,
        email: r.email,
        displayName: r.displayName || r.email.split("@")[0],
        photoURL: r.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(r.email)}`,
        phone: r.phone,
        lastLogin: r.lastLogin ? r.lastLogin.toISOString() : new Date().toISOString()
      }));
      res.json(mapped);
    } catch (queryErr: any) {
      console.error("Database select failure:", queryErr);
      throw new Error("Unable to fetch guest list from database.", { cause: queryErr });
    }
  } catch (error: any) {
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
