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

        for (let participant of participantRecords || []) {
            const { data: u } = await db
                .from("app_user")
                .select("*")
                .eq("id", participant.user_id)
                .single();

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

        addableMembers = buildingMembers
            .filter((m) => {
                const isAlready = currentIds.has(m.userId);
                const isOwner2 = m.userId === d.ownerId;
                const isAdmin2 =
                    (m.roleInBuilding || m.role || "").toLowerCase() === "admin";
                return !isAlready && !isOwner2 && !isAdmin2;
            })
            .map((m) => ({
                userId: m.userId,
                name:
                    [m.firstName, m.lastName].filter(Boolean).join(" ") ||
                    m.email ||
                    m.userId,
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
    const d = assertDiscussion(discussionId);
    const isOwner = d.ownerId === authUser.sub;
    const canEdit = authUser.role === "admin" || isOwner;

    if (!canEdit) {
        throw new AppError("Nemate ovlasti za uređivanje sudionika", 403);
    }
    const list = Array.isArray(participants) ? participants : [];

    if (!list.includes(d.ownerId)) {
        list.push(d.ownerId);
    }

    // db.discussionParticipants = db.discussionParticipants.filter(
    //     (p) => p.discussionId !== discussionId
    // );

    let discussionParticipants = await db
        .from("discussion_participant")
        .select("*")
        .eq("discussion_id", discussionId);

    for (const userId of list) {
        // const u = db.users.find((x) => x.id === userId);

        const u = await db.from("app_user").select("*").eq("id", user_id);

        if (u && u.role === "admin") {
            continue;
        }
        // db.discussionParticipants.push({
        //     discussionId,
        //     userId,
        //     canPost: true,
        // });

        await db.from("discussion_participant").insert({
            discussion_id: discussionId,
            user_id: userId,
            can_post: true,
        });
    }

    // return {
    //     id: d.id,
    //     isPrivate: d.isPrivate,
    //     participants: db.discussionParticipants
    //         .filter((p) => p.discussionId === discussionId)
    //         .map((p) => ({ userId: p.userId, canPost: p.canPost })),
    // };

    return {
        id: d.id,
        isPrivate: d.isPrivate,
        participants: await db
            .from("discussion_participant")
            .select("*")
            .eq("discussion_id", discussionId)
            .then((rows) =>
                rows.map((p) => ({ userId: p.user_id, canPost: p.can_post }))
            ),
    };
}
