import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { castVote, getVoteSummary } from "../services/votesService.js";

const router = Router();

router.post("/:pollId/vote", requireAuth, async (req, res, next) => {
    try {
        const { value } = req.body || {};
        const result = await castVote(req.params.pollId, req.user, value);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get("/:pollId/vote-summary", requireAuth, async (req, res, next) => {
    try {
        const summary = await getVoteSummary(req.params.pollId, req.user);
        return res.json(summary);
    } catch (err) {
        next(err);
    }
});

export default router;
