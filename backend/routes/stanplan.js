import { Router } from "express";
import { listPositiveOutcomeDiscussions } from "../services/stanplanService.js";
import { stanplanAuth } from "../middleware/stanplanAuth.js";

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


export default router;
