import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { loginUser, getMe } from "../services/authService.js";

const router = Router();

//prijava (vraca token + user)
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const { token, user } = await loginUser(email, password);
        return res.json({ token, user });
    } catch (err) {
        next(err);
    }
});

//podaci o prijavljenom korisniku
router.get("/me", requireAuth, async (req, res, next) => {
    try {
        return res.json(await getMe(req.user));
    } catch (err) {
        next(err);
    }
});

export default router;
