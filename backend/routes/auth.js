import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { issueToken, requireAuth } from "../middleware/auth.js";

const router = Router();

//registracija
router.post("/register", async (req, res) => {
  const { email, password, role = "suvlasnik" } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });

  const exists = db.users.find(u => u.email === email);
  if (exists) return res.status(409).json({ error: "email already exists" });

  const passHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, role, passHash };
  db.users.push(user);
  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

//login(vraca jwt)
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = issueToken(user);
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

//podaci o racunu
router.get("/me", requireAuth, (req, res) => {
  const u = db.users.find(u => u.id === req.user.sub);
  if (!u) return res.status(404).json({ error: "not found" });
  res.json({ id: u.id, email: u.email, role: u.role });
});

export default router;