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
            const { token, user } = await loginWithGoogleProfile(req.user);

            const isAdmin = (user.role || "").toLowerCase() === "admin";

            return res.send(`
        <!doctype html>
        <html>
          <head><meta charset="utf-8"><title>Prijava...</title></head>
          <body>
            <script>
              localStorage.setItem("token", ${JSON.stringify(token)});
              localStorage.setItem("user", ${JSON.stringify(JSON.stringify(user))});
              window.location.href = "${process.env.WEBSITE_URL}${isAdmin ? "/admin" : "/"}";
            </script>
          </body>
        </html>
      `);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
