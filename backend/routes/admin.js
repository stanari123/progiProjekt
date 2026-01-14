import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createUser } from "../services/adminService.js";
import { listMyBuildings } from "../services/buildingsService.js";

const router = Router();

//lista zgrada
router.get("/buildings", requireAuth, async (req, res, next) => {
    try {
        return res.json(await listMyBuildings(req.user));
    } catch (err) {
        next(err);
    }
});

import { createBuilding } from "../services/buildingsService.js";

// kreiranje nove zgrade (samo admin)
router.post("/buildings", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const b = await createBuilding(req.body);
    return res.status(201).json(b);
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
