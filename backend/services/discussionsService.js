import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { userInBuilding } from "./buildingsService.js";
import { sendEmail } from "../middleware/email.js";

// helpers
function isAdminRole(role) {
    return (role || "").toLowerCase() === "admin";
}

export function buildDisplayName(user) {
    if (!user) return "(nepoznat)";
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
    if (full) return full;
    if (user.role === "admin") return "Administrator";
    return user.email || "(nepoznat)";
}

export async function userCanAccessDiscussion(discussion, authUser) {
    if (!discussion) return false;

    const userId = authUser?.sub;
    const role = authUser?.role;

    if (isAdminRole(role)) return true;
    if (!userId) return false;

    if (discussion.visibility === "javno") return true;
    if (discussion.owner_id === userId) return true;

    const { data: rows, error } = await db
        .from("discussion_participant")
        .select("user_id")
        .eq("discussion_id", discussion.id)
        .eq("user_id", userId);

    if (error) return false;
    return Array.isArray(rows) && rows.length > 0;
}

export async function assertDiscussion(id) {
    const { data, error } = await db.from("discussion").select("*").eq("id", id).single();

    if (error || !data) throw new AppError("Diskusija nije pronađena", 404);
    return data;
}

export async function listDiscussions(authUser, buildingId) {
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const userId = authUser?.sub;
    if (!userId) throw new AppError("Neispravan token (nema sub)", 401);

    const role = authUser?.role;

    if (!isAdminRole(role) && !(await userInBuilding(userId, buildingId))) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const { data: discussions, error: dErr } = await db
        .from("discussion")
        .select("*")
        .eq("building_id", buildingId);

    if (dErr) throw new AppError(dErr.message || "Greška pri dohvaćanju rasprava", 500);

    const list = discussions || [];
    if (list.length === 0) return [];

    const discussionIds = list.map((d) => d.id);

    let participantSet = new Set();
    if (!isAdminRole(role) && discussionIds.length > 0) {
        const { data: partRows, error: pErr } = await db
            .from("discussion_participant")
            .select("discussion_id")
            .eq("user_id", userId)
            .in("discussion_id", discussionIds);

        if (pErr) {
            console.error("participantSet error:", pErr);
        } else {
            participantSet = new Set((partRows || []).map((r) => r.discussion_id));
        }
    }

    const ownerIds = [...new Set(list.map((d) => d.owner_id).filter(Boolean))];
    let ownerMap = new Map();

    if (ownerIds.length > 0) {
        const { data: owners, error: oErr } = await db
            .from("app_user")
            .select("id,email,role,first_name,last_name")
            .in("id", ownerIds);

        if (oErr) {
            console.error("owner lookup error:", oErr);
        } else {
            ownerMap = new Map((owners || []).map((o) => [o.id, buildDisplayName(o)]));
        }
    }

    for (const d of list) {
        d.ownerName = ownerMap.get(d.owner_id) || d.ownerName || "";

        if (isAdminRole(role)) d.canViewContent = true;
        else if (d.visibility === "javno") d.canViewContent = true;
        else if (d.owner_id === userId) d.canViewContent = true;
        else d.canViewContent = participantSet.has(d.id) === true;
    }

    return list;
}

export async function createDiscussion(
    authUser,
    buildingId,
    title,
    body = "",
    isPrivate = false,
    participants = [],
) {
    if (!title?.trim()) throw new AppError("Naslov je obavezan", 400);
    const trimmedTitle = title.trim();
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const userId = authUser?.sub;
    const role = authUser?.role;

    if (!userId) throw new AppError("Neispravan token (nema sub)", 401);

    const { data: userRecord, error: uErr } = await db
        .from("app_user")
        .select("id, role")
        .eq("id", userId)
        .single();

    if (uErr || !userRecord) throw new AppError("Korisnik nije pronađen", 401);

    if (!isAdminRole(role) && !(await userInBuilding(userRecord.id, buildingId))) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const { data: inserted, error: insErr } = await db
        .from("discussion")
        .insert({
            title: trimmedTitle,
            building_id: buildingId,
            owner_id: userRecord.id,
            visibility: isPrivate ? "privatno" : "javno",
            status: "otvoreno",
            poll_description: (body || "").trim(),
        })
        .select();

    if (insErr)
        throw new AppError(insErr.message || "Greška pri stvaranju rasprave", 500);
    if (!inserted || inserted.length === 0)
        throw new AppError("Greška pri stvaranju rasprave", 500);

    const discussionId = inserted[0].id;

    try {
        if (isPrivate) {
            const names = Array.isArray(participants)
                ? [...new Set(participants)]
                      .map((p) => (typeof p === "string" ? p.trim() : ""))
                      .filter(Boolean)
                : [];

            if (names.length > 0) {
                const { data: members, error: memErr } = await db
                    .from("building_membership")
                    .select("user_id")
                    .eq("building_id", buildingId);

                if (memErr)
                    throw new AppError("Greška pri dohvaćanju članova zgrade", 500);

                const memberIds = new Set((members || []).map((m) => m.user_id));
                if (memberIds.size === 0) throw new AppError("Zgrada nema članova", 400);

                const { data: users, error: usersErr } = await db
                    .from("app_user")
                    .select("id, first_name, last_name, email")
                    .in("id", [...memberIds]);

                if (usersErr) throw new AppError("Greška pri dohvaćanju korisnika", 500);

                const nameToId = new Map(
                    (users || []).map((u) => [
                        `${u.first_name || ""} ${u.last_name || ""}`.trim(),
                        u.id,
                    ]),
                );

                const participantIds = names
                    .map((n) => nameToId.get(n))
                    .filter(Boolean)
                    .filter((id) => id !== userRecord.id);

                if (participantIds.length === 0) {
                    throw new AppError(
                        "Odabrani sudionici nisu valjani članovi zgrade",
                        400,
                    );
                }

                const participantIdSet = new Set(participantIds);
                const participantUsers = (users || []).filter((u) =>
                    participantIdSet.has(u.id),
                );

                const participantRecords = participantIds.map((uid) => ({
                    discussion_id: discussionId,
                    user_id: uid,
                    can_post: true,
                }));

                const { error: pErr } = await db
                    .from("discussion_participant")
                    .insert(participantRecords);

                if (pErr) {
                    console.error("insert discussion_participant error:", pErr);
                    throw new AppError("Greška pri dodavanju sudionika", 500);
                }

                // email notifications
                const emailSubject = `Dodani ste u raspravu "${trimmedTitle}"`;
                const emailHtml =
                    `<p>Pozdrav,</p>` +
                    `<p>Dodani ste u privatnu raspravu "<strong>${trimmedTitle}</strong>".</p>` +
                    `<p>Prijavite se na StanBlog kako biste pročitali i sudjelovali u raspravi.</p>`;

                const emailPromises = participantUsers
                    .map((u) => u.email)
                    .filter(Boolean)
                    .map((email) => sendEmail(email, emailSubject, emailHtml));

                if (emailPromises.length > 0) {
                    await Promise.allSettled(emailPromises);
                }
            }
        }

        return inserted;
    } catch (err) {
        await db.from("discussion").delete().eq("id", discussionId);

        if (err instanceof AppError) throw err;
        throw new AppError(err?.message || "Greška pri stvaranju privatne rasprave", 500);
    }
}
