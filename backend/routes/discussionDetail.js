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

router.patch("/:id/close", requireAuth, (req, res, next) => {
    try {
        const d = closeDiscussion(req.params.id, req.user);
        return res.json(d);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/open", requireAuth, (req, res, next) => {
    try {
        return res.json(reopenDiscussion(req.params.id, req.user));
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/participants", requireAuth, (req, res, next) => {
    try {
        const { participants = [] } = req.body || {};
        return res.json(setDiscussionParticipants(req.params.id, req.user, participants));
    } catch (e) {
        next(e);
    }
});

export default router;
