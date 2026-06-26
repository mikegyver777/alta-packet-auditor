// Alta Packet Auditor — backend
// Holds the Anthropic API key. Receives page images from the browser, sends them
// with the RULEBOOK to Claude (vision), returns ONLY the flags (problems).

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { RULEBOOK } from "./rulebook.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "40mb" })); // page images are large

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

app.post("/api/audit", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY (set it in Render → Environment)." });
    const { images } = req.body || {};   // array of base64 JPEGs, one per page
    if (!Array.isArray(images) || !images.length) return res.status(400).json({ error: "No page images provided." });

    const content = [];
    images.forEach((b64, i) => {
      content.push({ type: "text", text: `PAGE ${i + 1}:` });
      content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
    });
    content.push({ type: "text", text: RULEBOOK });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 3000, messages: [{ role: "user", content }] }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: `Anthropic API ${r.status}`, detail });
    }
    const data = await r.json();
    const txt = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("").replace(/```json|```/g, "").trim();
    let result;
    try { result = JSON.parse(txt); }
    catch { return res.status(502).json({ error: "Could not parse model output.", raw: txt }); }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.use(express.static(join(__dirname, "public")));
app.get("*", (_req, res) => res.sendFile(join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Alta Packet Auditor on :${PORT}`));
