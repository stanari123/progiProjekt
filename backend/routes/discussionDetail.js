import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
    getDiscussionById,
    closeDiscussion,
    reopenDiscussion,
    setDiscussionParticipants,
} from "../services/discussionDetailsService.js";

const router = Router();

router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const d = await getDiscussionById(req.params.id, req.user);
        return res.json(d);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/close", requireAuth, async (req, res, next) => {
    try {
        const d = await closeDiscussion(req.params.id, req.user);
        return res.json(d);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/open", requireAuth, async (req, res, next) => {
    try {
        const d = await reopenDiscussion(req.params.id, req.user);
        return res.json(d);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/participants", requireAuth, async (req, res, next) => {
    try {
        const { participants = [] } = req.body || {};
        const out = await setDiscussionParticipants(req.params.id, req.user, participants);
        return res.json(out);
    } catch (e) {
        next(e);
    }
});

export default router;
