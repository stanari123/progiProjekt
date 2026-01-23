import { Router } from "express";
import passport from "passport";
import { loginWithGoogleProfile } from "../services/authService.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const failureRedirect = `${process.env.WEBSITE_URL}/login`;

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect:
            failureRedirect +
            `?error=${encodeURIComponent("User doesn't exist. Contact the admin to create the account.")}`,
    }),
    async (req, res, next) => {
        try {
            const { token } = await loginWithGoogleProfile(req.user);

            const redirectUrl = `${process.env.WEBSITE_URL}/login?token=${encodeURIComponent(token)}`;
            return res.redirect(redirectUrl);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
