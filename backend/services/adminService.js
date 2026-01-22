import bcrypt from "bcryptjs";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";

export class User {
    constructor(id, firstName, lastName, email, role, password) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.password = password;
    }
}

export async function findUserByEmail(email = "") {
    const lowercaseEmail = email.toLowerCase();
    const { data } = await db
        .from("app_user")
        .select("*")
        .eq("email", lowercaseEmail)
        .single();

    if (!data) return null;

    return new User(
        data.id,
        data.first_name,
        data.last_name,
        data.email,
        data.role,
        data.password_hash
    );
}

async function addMembership(userId, buildingIds, role) {
    const ids = Array.isArray(buildingIds)
        ? [...new Set(buildingIds.map((x) => String(x)).filter(Boolean))]
        : [];

    if (ids.length === 0) return;

    const rows = ids.map((buildingId) => ({
        user_id: userId,
        building_id: buildingId,
        user_role: role,
    }));

    const { error } = await db
        .from("building_membership")
        .upsert(rows, { onConflict: "user_id,building_id" });

    if (error) {
        throw new AppError("Greška pri dodavanju korisnika u zgradu.", 500);
    }
}

export async function createUser(currentUser, newUser) {
    if (!currentUser || (currentUser.role || "").toLowerCase() !== "admin") {
        throw new AppError("Samo admin može kreirati korisnike.", 403);
    }

    if (!newUser.email || !newUser.password) {
        throw new AppError("E-pošta i lozinka su obavezni.", 400);
    }

    const { data: existing } = await db
        .from("app_user")
        .select("*")
        .eq("email", newUser.email)
        .single();

    if (existing) {
        throw new AppError("Korisnik s tom e-poštom već postoji.", 409);
    }

    const passHash = await bcrypt.hash(newUser.password, 10);

    const { data, error } = await db
        .from("app_user")
        .insert({
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            email: newUser.email,
            password_hash: passHash,
            role: newUser.role,
        })
        .select();

    if (error || !data || data.length === 0) {
        throw new AppError("Greška pri kreiranju korisnika", 500);
    }

    const user = new User(
        data[0].id,
        newUser.firstName,
        newUser.lastName,
        newUser.email,
        newUser.role,
        passHash
    );

    await addMembership(data[0].id, newUser.buildingIds || [], newUser.role);

    return user;
}

export async function listUsers() {
    const { data, error } = await db
        .from("app_user")
        .select("id, first_name, last_name, email, role")
        .order("last_name", { ascending: true });

    if (error) throw new AppError("Greška pri dohvaćanju korisnika.", 500);

    return (data || []).map((u) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        role: u.role,
    }));
}

export async function addBuildingMembers(buildingId, userIds) {
    if (!buildingId) throw new AppError("buildingId je obavezan.", 400);

    const ids = Array.isArray(userIds)
        ? [...new Set(userIds.map((x) => String(x)).filter(Boolean))]
        : [];

    if (ids.length === 0) return { added: 0 };

    const { data: users, error: uErr } = await db
        .from("app_user")
        .select("id, role")
        .in("id", ids);

    if (uErr) throw new AppError("Greška pri dohvaćanju korisnika.", 500);

    const rows = (users || []).map((u) => ({
        user_id: u.id,
        building_id: buildingId,
        user_role: u.role || "suvlasnik",
    }));

    const { error: insErr } = await db
        .from("building_membership")
        .upsert(rows, { onConflict: "user_id,building_id" });
    if (insErr) throw new AppError("Greška pri dodavanju članova u zgradu.", 500);

    return { added: rows.length };
}

export async function removeBuildingMembers(buildingId, userIds) {
    if (!buildingId) throw new AppError("buildingId je obavezan.", 400);

    const ids = Array.isArray(userIds)
        ? [...new Set(userIds.map((x) => String(x)).filter(Boolean))]
        : [];

    if (ids.length === 0) return { removed: 0 };

    const { error, count } = await db
        .from("building_membership")
        .delete({ count: "exact" })
        .eq("building_id", buildingId)
        .in("user_id", ids);

    if (error) throw new AppError("Greška pri uklanjanju članova iz zgrade.", 500);

    return { removed: count || 0 };
}
