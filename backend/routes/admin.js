import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createUser } from "../services/adminService.js";
import { listMyBuildings } from "../services/buildingsService.js";

const router = Router();

//lista zgrada
router.get("/buildings", requireAuth, async (req, res, next) => {
  try {
    return res.json(listMyBuildings(req.user));
  } catch (err) {
    next(err);
  }
});

//kreiranje novih usera
router.post("/users", requireAuth, async (req, res, next) => {
  try {
    const newUser = await createUser(req.user, req.body);
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

export default router;
