import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createUser, listUsers, addBuildingMembers, removeBuildingMembers } from "../services/adminService.js";
import { listMyBuildings, createBuilding } from "../services/buildingsService.js";
import { getStanPlanLink, setStanPlanLink } from "../services/stanplanConfigService.js";

const router = Router();

// lista zgrada
router.get("/buildings", requireAuth, async (req, res, next) => {
    try {
        return res.json(await listMyBuildings(req.user));
    } catch (err) {
        next(err);
    }
});

// kreiranje nove zgrade (samo admin)
router.post("/buildings", requireAuth, requireRole("admin"), async (req, res, next) => {
    try {
        const b = await createBuilding(req.body, req.user);
        return res.status(201).json(b);
    } catch (err) {
        next(err);
    }
});

// kreiranje novih usera (samo admin)
router.post("/users", requireAuth, requireRole("admin"), async (req, res, next) => {
    try {
        const newUser = await createUser(req.user, req.body);
        return res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
});

// lista svih usera (za dodaj članove tab)
router.get("/users", requireAuth, requireRole("admin"), async (req, res, next) => {
    try {
        return res.json(await listUsers());
    } catch (err) {
        next(err);
    }
});

// dodaj članove u zgradu
router.post(
    "/buildings/:buildingId/members/add",
    requireAuth,
    requireRole("admin"),
    async (req, res, next) => {
        try {
            const { buildingId } = req.params;
            const { userIds } = req.body || {};
            const out = await addBuildingMembers(buildingId, userIds);
            return res.status(200).json(out);
        } catch (err) {
            next(err);
        }
    }
);

// ukloni članove iz zgrade
router.post(
    "/buildings/:buildingId/members/remove",
    requireAuth,
    requireRole("admin"),
    async (req, res, next) => {
        try {
            const { buildingId } = req.params;
            const { userIds } = req.body || {};
            const out = await removeBuildingMembers(buildingId, userIds);
            return res.status(200).json(out);
        } catch (err) {
            next(err);
        }
    }
);

// StanPlan link (samo admin)
router.get("/stanplan-link", 
    requireAuth, 
    requireRole("admin"), 
    async (req, res, next) => {
        try {
            return res.json(await getStanPlanLink());
        } catch (err) {
            next(err);
        }
    }
);

router.post("/stanplan-link",
    requireAuth, 
    requireRole("admin"), 
    async (req, res, next) => {
        try {
            const { link } = req.body || {};
            return res.json(await setStanPlanLink(link));
        } catch (err) {
            next(err);
        }
    }
);


export default router;
