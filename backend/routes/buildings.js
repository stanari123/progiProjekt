import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listMyBuildings, listMembers } from "../services/buildingsService.js";

const router = Router();

//lista zgrada
router.get("/my", requireAuth, async (req, res, next) => {
    try {
        return res.json(await listMyBuildings(req.user));
    } catch (e) {
        next(e);
    }
});

//lista clanova
router.get("/:id/members", requireAuth, async (req, res, next) => {
    try {
        return res.json(await listMembers(req.params.id, req.user));
    } catch (e) {
        next(e);
    }
});

export default router;
