import { Router } from "express";
import { db } from "../data/memory.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

//glasanje
router.post("/:id/votes", requireAuth, (req, res) => {
  const { id } = req.params;
  const { value } = req.body || {};
  if (!["yes", "no"].includes(value)) return res.status(400).json({ error: "value must be yes|no" });

  const d = db.discussions.find(x => x.id === id);
  if (!d) return res.status(404).json({ error: "discussion not found" });

  // jedan glas po korisniku
  const idx = db.votes.findIndex(v => v.discussionId === id && v.userId === req.user.sub);
  if (idx >= 0) db.votes[idx].value = value;
  else db.votes.push({ discussionId: id, userId: req.user.sub, value });

  res.status(204).end();
});

//provjera je li 1/4 suvlasnika za
router.get("/:id/votes/summary", requireAuth, (req, res) => {
  const { id } = req.params;
  const d = db.discussions.find(x => x.id === id);
  if (!d) return res.status(404).json({ error: "discussion not found" });

  const all = db.votes.filter(v => v.discussionId === id);
  const yes = all.filter(v => v.value === "yes").length;
  const no = all.filter(v => v.value === "no").length;
  const totalOwners = db.users.filter(u => u.role === "suvlasnik").length || 1; // zaštita od /0
  const thresholdReached = yes > totalOwners / 4;

  res.json({ total: all.length, yes, no, totalOwners, thresholdReached });
});

export default router;