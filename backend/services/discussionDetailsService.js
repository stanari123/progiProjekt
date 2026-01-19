import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { getRoleInBuilding, userInBuilding, listMembers } from "./buildingsService.js";
import { getActivePoll } from "./pollService.js";
import {
    buildDisplayName,
    userCanAccessDiscussion,
    assertDiscussion,
} from "./discussionsService.js";
import auth from "basic-auth";

export async function getDiscussionById(id, authUser) {
    const d = await assertDiscussion(id);

    // console.log("Asserting discussion for id:", id, "and user:", authUser);

    const { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (authUser.role !== "admin" && user && !userInBuilding(user.id, d.building_id)) {
        throw new AppError("Zabranjen pristup diskusiji", 403);
    }

    const isOwner = user && d.owner_id === user.id;

    const canModerate =
        authUser.role === "admin" || (user && user.role === "admin") || isOwner;

    const canViewContent = await userCanAccessDiscussion(d, authUser);

    const { data: owner } = await db
        .from("app_user")
        .select("*")
        .eq("id", d.owner_id)
        .single();
    const ownerName = d.ownerName || buildDisplayName(owner);

    let participants = [];
    if (d.visibility === "privatno") {
        const { data: participantRecords } = await db
            .from("discussion_participant")
            .select("*")
            .eq("discussion_id", d.id);

        for (const participant of participantRecords || []) {
            const { data: u } = await db
                .from("app_user")
                .select("id, role, first_name, last_name, email")
                .eq("id", participant.user_id)
                .single();

            if (u && (u.role || "").toLowerCase() === "admin") {
            continue; // admin nikad ne ide u listu sudionika
            }

            participants.push({
            userId: participant.user_id,
            name: u ? buildDisplayName(u) : participant.user_id,
            canPost: participant.can_post !== false,
            });
        }
    }


    const activePoll = await getActivePoll(d.id);
    const poll =
        canViewContent && activePoll
            ? {
                  id: activePoll.id,
                  question: activePoll.question,
                  active: !activePoll.closed,
                  createdAt: activePoll.created_at,
              }
            : null;

    let addableMembers = [];
    const canEditParticipants = authUser.role === "admin" || isOwner;

    if (canEditParticipants && d.visibility === "privatno") {
        const buildingMembers = await listMembers(d.building_id, authUser);
        const currentIds = new Set(participants.map((p) => p.userId));
        const ownerId = String(d.owner_id);

        addableMembers = buildingMembers
        .filter((m) => {
            const uid = String(m.userId);

            const isAlready = currentIds.has(uid);
            const isOwner2 = uid === ownerId;
            const isAdmin2 = (m.roleInBuilding || "").toLowerCase() === "admin";

            return !isAlready && !isOwner2 && !isAdmin2;
        })
        .map((m) => ({
            userId: String(m.userId),
            name: [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.email || String(m.userId),
            roleInBuilding: m.roleInBuilding || "suvlasnik",
        }));
    }

    return {
        ...d,
        ownerName,
        canModerate,
        canViewContent,
        poll_description: canViewContent ? d.poll_description : "",
        participants,
        poll,
        addableMembers,
    };
}

export async function closeDiscussion(id) {
    const { data: updated, error } = await db
        .from("discussion")
        .update({ status: "zatvoreno" })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new AppError(error.message || "Greška pri zatvaranju rasprave", 500);
    if (!updated) throw new AppError("Rasprava ne postoji", 404);
    return updated;
}

export async function reopenDiscussion(id) {
    const { data: updated, error } = await db
        .from("discussion")
        .update({ status: "otvoreno" })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new AppError(error.message || "Greška pri otvaranju rasprave", 500);
    if (!updated) throw new AppError("Rasprava ne postoji", 404);
    return updated;
}

export async function setDiscussionParticipants(discussionId, authUser, participants) {
    const d = await assertDiscussion(discussionId);

    if (d.visibility !== "privatno") {
        throw new AppError("Sudionici se mogu uređivati samo za privatne rasprave", 400);
    }

    const { data: me, error: meErr } = await db
        .from("app_user")
        .select("id, role")
        .eq("email", authUser.email)
        .single();

    if (meErr || !me) throw new AppError("Korisnik nije pronađen", 401);

    const isAdmin = (authUser.role || "").toLowerCase() === "admin" || (me.role || "").toLowerCase() === "admin";
    const isOwner = String(d.owner_id) === String(me.id);

    if (!isAdmin && !isOwner) {
        throw new AppError("Nemate ovlasti za uređivanje sudionika", 403);
    }

    const list = Array.isArray(participants) ? participants : [];
    const set = new Set(list.map((x) => String(x)).filter(Boolean));

    set.delete(String(d.owner_id));

    const { data: adminRows, error: aErr } = await db
        .from("app_user")
        .select("id")
        .eq("role", "admin");

    if (aErr) throw new AppError("Greška pri dohvaćanju admina", 500);

    for (const a of adminRows || []) {
        set.delete(String(a.id));
    }

    const finalIds = Array.from(set);

    const { error: delErr } = await db
        .from("discussion_participant")
        .delete()
        .eq("discussion_id", d.id);

    if (delErr) throw new AppError("Greška pri brisanju starih sudionika", 500);

    if (finalIds.length > 0) {
        const rows = finalIds.map((uid) => ({
        discussion_id: d.id,
        user_id: uid,
        can_post: true,
        }));

        const { error: insErr } = await db.from("discussion_participant").insert(rows);
        if (insErr) throw new AppError("Greška pri spremanju sudionika", 500);
    }

    const { data: out, error: outErr } = await db
        .from("discussion_participant")
        .select("user_id, can_post")
        .eq("discussion_id", d.id);

    if (outErr) throw new AppError("Greška pri dohvaćanju sudionika", 500);

    return {
        id: d.id,
        isPrivate: true,
        participants: (out || []).map((p) => ({
        userId: p.user_id,
        canPost: p.can_post !== false,
        })),
    };
}
