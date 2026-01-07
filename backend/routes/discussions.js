import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listDiscussions, createDiscussion } from "../services/discussionsService.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
    try {
        const { buildingId } = req.query;
        const list = await listDiscussions(req.user, buildingId);
        return res.json(list);
    } catch (e) {
        next(e);
    }
});

router.post("/", requireAuth, async (req, res, next) => {
    try {
        const {
            title,
            body,
            isPrivate = false,
            buildingId,
            participants = [],
        } = req.body || {};
        return res
            .status(201)
            .json(
                await createDiscussion(
                    req.user,
                    buildingId,
                    title,
                    body,
                    isPrivate,
                    participants
                )
            );
    } catch (e) {
        next(e);
    }
});

export default router;
