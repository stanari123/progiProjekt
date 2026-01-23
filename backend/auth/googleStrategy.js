import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../data/memory.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) return done(null, false);

                const { data: user, error } = await db
                    .from("app_user")
                    .select("id, email, role, first_name, last_name")
                    .eq("email", email.toLowerCase())
                    .maybeSingle();

                if (!user) return done(null, false);

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        },
    ),
);
