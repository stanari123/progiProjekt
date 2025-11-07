import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { castVote, getVoteSummary } from "../services/votesService.js";

const router = Router();

router.post("/:id/votes", requireAuth, (req, res, next) => {
  try {
    const { value } = req.body || {};
    const result = castVote(req.params.id, req.user.sub, value);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/votes/summary", requireAuth, (req, res, next) => {
  try {
    const summary = getVoteSummary(req.params.id, req.user.sub);
    return res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
