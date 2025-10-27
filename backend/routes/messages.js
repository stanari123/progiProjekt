import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

//lista poruka
router.get("/:id/messages", requireAuth, (req, res) => {
  const { id } = req.params;
  const discussion = db.discussions.find(d => d.id === id);
  if (!discussion) return res.status(404).json({ error: "discussion not found" });

  const msgs = db.messages.filter(m => m.discussionId === id);
  res.json(msgs);
});

//dodaj poruku
router.post("/:id/messages", requireAuth, (req, res) => {
  const { id } = req.params;
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: "body required" });

  const discussion = db.discussions.find(d => d.id === id);
  if (!discussion) return res.status(404).json({ error: "discussion not found" });

  const msg = {
    id: nanoid(),
    discussionId: id,
    authorId: req.user.sub,
    body,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(msg);
  res.status(201).json(msg);
});

export default router;