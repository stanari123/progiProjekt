import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listMessagesForUser,
  addMessageToDiscussion,
} from "../services/messagesService.js";

const router = Router();

router.get("/:id/messages", requireAuth, (req, res, next) => {
  try {
    return res.json(listMessagesForUser(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
});

router.post("/:id/messages", requireAuth, (req, res, next) => {
  try {
    return res.status(201).json(addMessageToDiscussion(req.params.id,req.user, req.body?.body || ""));
  } catch (err) {
    next(err);
  }
});

export default router;
