import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../data/memory.js";
import bcrypt from "bcryptjs";

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

        if (error) return done(error);

        let finalUser = user;

        if (!finalUser) {
          const { data: created, error: insErr } = await db
            .from("app_user")
            .insert({
              email: email.toLowerCase(),
              role: "suvlasnik",
              first_name: profile.name?.givenName ?? "",
              last_name: profile.name?.familyName ?? "",
              password_hash: await bcrypt.hash("korisnik", 10),
            })
            .select()
            .maybeSingle();

          if (insErr) return done(insErr);
          finalUser = created;
        }

        return done(null, finalUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);
