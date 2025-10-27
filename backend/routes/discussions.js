import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { issueToken, requireAuth } from "../middleware/auth.js";

const router = Router();

//lista diskusija
router.get("/", requireAuth, (_req, res) => {
  res.json(db.discussions);
});

//stvori diskusiju
router.post("/", requireAuth, (req, res) => {
  const { title, body = "", isPrivate = false } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });

  const d = {
    id: nanoid(),
    title,
    body,
    isPrivate,
    ownerId: req.user.sub,
    createdAt: new Date().toISOString(),
  };
  db.discussions.push(d);
  res.status(201).json(d);
});

//otvori diskusiju
router.get("/:id", requireAuth, (req, res) => {
  const d = db.discussions.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "not found" });
  res.json(d);
});

export default router;