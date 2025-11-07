import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listDiscussions,
  createDiscussion,
} from "../services/discussionsService.js";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  try {
    const { buildingId } = req.query;
    const list = listDiscussions(req.user, buildingId);
    return res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, (req, res, next) => {
  try {
    const { title, body, isPrivate = false, buildingId } = req.body || {};
    return res.status(201).json(createDiscussion(req.user, buildingId, title, body, isPrivate));
  } catch (e) {
    next(e);
  }
});

export default router;
