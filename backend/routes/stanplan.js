import { Router } from "express";
import { listPositiveOutcomeDiscussions, createMeetingFromDiscussion } from "../services/stanplanService.js";
import { stanplanAuth } from "../middleware/stanplanAuth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// API za StanPlan - vraca listu diskusija s pozitivnim ishodom glasovanja
router.get(
  "/discussions/positive",
  stanplanAuth,
  async (req, res, next) => {
    try {
      const { buildingName } = req.query;
      const list = await listPositiveOutcomeDiscussions(buildingName || null);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

// Predstavnik saziva sastanak kad je prag dosegnut
router.post(
  "/meetings/from-discussion/:discussionId",
  requireAuth,
  requireRole("predstavnik"),
  async (req, res, next) => {
    try {
      const { discussionId } = req.params;
      const { datetime } = req.body || {};
      const out = await createMeetingFromDiscussion(discussionId, datetime, req.user);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
