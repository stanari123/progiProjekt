import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { startPoll, cancelPoll, getActivePoll } from "../services/pollService.js";

const router = Router();

router.get("/:id/poll", requireAuth, async (req, res, next) => {
    try {
        const poll = await getActivePoll(req.params.id);
        return res.json(poll);
    } catch (e) {
        next(e);
    }
});

router.post("/:id/poll", requireAuth, async (req, res, next) => {
    try {
        const q = req.body?.question;
        return res.status(201).json(await startPoll(req.params.id, req.user, q));
    } catch (e) {
        next(e);
    }
});

router.delete("/:id/poll", requireAuth, async (req, res, next) => {
    try {
        return res.json(await cancelPoll(req.params.id, req.user));
    } catch (e) {
        next(e);
    }
});

export default router;
