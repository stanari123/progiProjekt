import bcrypt from "bcryptjs";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { issueToken } from "../middleware/auth.js";
import { findUserByEmail } from "./adminService.js";
import { sendEmail } from "../middleware/email.js";

// login — vraća token i user info
export async function loginUser(email, password) {
    const user = await findUserByEmail(email);

    if (!user) throw new AppError("Neispravni podaci", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError("Neispravni podaci", 401);

    const token = issueToken(user);
    return {
        token,
        user: {
            email: user.email,
            role: user.role,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
        },
    };
}

//info o aktivnom useru
export async function getMe(reqUser) {
    const { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", reqUser.email)
        .maybeSingle();

    if (!user) {
        throw new AppError("Korisnik nije pronađen", 404);
    }

    return {
        email: user.email,
        role: user.role,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
    };
}

// google login
export async function loginWithGoogleProfile(googleUser) {
    if (!googleUser || !googleUser.email) {
        throw new AppError("Nedostaje email iz Google profila", 400);
    }

    const email = googleUser.email.toLowerCase();

    //googleStrategy je handleao da postoji
    const { data: user, error } = await db
        .from("app_user")
        .select("id, email, role, first_name, last_name")
        .eq("email", email)
        .maybeSingle();

    if (error || !user) {
        throw new AppError("Korisnik nije pronađen nakon Google prijave", 404);
    }

    const token = issueToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name || "",
            lastName: user.last_name || "",
        },
    };
}

// promjena lozinke
export async function changePassword(reqUser, currentPassword, newPassword) {
    const curr = (currentPassword || "").trim();
    const next = (newPassword || "").trim();

    if (!curr || !next) throw new AppError("Sva polja su obavezna.", 400);
    if (next.length < 6)
        throw new AppError("Nova lozinka mora imati barem 6 znakova.", 400);
    if (curr === next)
        throw new AppError("Nova lozinka mora biti različita od trenutne.", 400);

    const { data: user, error } = await db
        .from("app_user")
        .select("id,email,password_hash")
        .eq("email", reqUser.email)
        .single();

    if (error || !user) throw new AppError("Korisnik nije pronađen", 404);

    // Ako nema lozinke (Google-only):
    if (!user.password_hash) {
        throw new AppError("Ovaj račun nema lozinku (Google prijava).", 400);
    }

    const ok = await bcrypt.compare(curr, user.password_hash);
    if (!ok) throw new AppError("Trenutna lozinka nije točna.", 401);

    const newHash = await bcrypt.hash(next, 10);

    const { error: updErr } = await db
        .from("app_user")
        .update({ password_hash: newHash })
        .eq("id", user.id);

    if (updErr) throw new AppError("Greška pri spremanju lozinke.", 500);

    sendEmail(
        user.email,
        "Lozinka je promijenjena",
        `<p>Poštovani,</p>
        <p>Vaša nova lozinka je: ${newPassword}</p>
        <p>Ako niste vi inicirali ovu promjenu, molimo vas da odmah kontaktirate našu podršku.</p>
        <p>Lijep pozdrav,<br/>StanBlog tim</p>`,
    ).catch((err) => {
        console.error("Greška pri slanju emaila o promjeni lozinke:", err);
    });

    return { ok: true };
}
