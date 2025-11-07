import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listMyBuildings,
  listMembers,
} from "../services/buildingsService.js";

const router = Router();

//lista zgrada
router.get("/my", requireAuth, (req, res, next) => {
  try {
    return res.json(listMyBuildings(req.user));
  } catch (e) {
    next(e);
  }
});

//lista clanova
router.get("/:id/members", requireAuth, (req, res, next) => {
  try {
    return res.json(listMembers(req.params.id, req.user));
  } catch (e) {
    next(e);
  }
});

export default router;
