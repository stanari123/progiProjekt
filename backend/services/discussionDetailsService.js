import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { getRoleInBuilding, userInBuilding, listMembers } from "./buildingsService.js";
import { getActivePoll } from "./pollService.js";
import {
    buildDisplayName,
    userCanAccessDiscussion,
    assertDiscussion,
} from "./discussionsService.js";

export async function getDiscussionById(id, authUser) {
    const d = await assertDiscussion(id);

    const { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email);

    if (authUser.role !== "admin" && !userInBuilding(user.id, d.buildingId)) {
        throw new AppError("Zabranjen pristup diskusiji", 403);
    }

    // const roleInB = getRoleInBuilding(user.id, d.id);
    const isOwner = d.owner_id === user.id;

    const canModerate = user.role === "admin" || isOwner;

    const canViewContent = await userCanAccessDiscussion(d, user);

    const owner = await db.from("app_user").select("*").eq("user_id", d.ownerId);
    const ownerName = d.ownerName || buildDisplayName(owner);

    let participants = [];
    if (d.visibility !== "javno") {
        participants = await db
            .from("discussion_participant")
            .select("*")
            .eq("discussion_id", d.id);
        for (let i = 0; i < participants.length; i++) {
            const u = await db
                .from("app_user")
                .select("*")
                .eq("id", participants[i].userId);

            participants[i] = {
                userId: participants[i].user_id,
                name: u ? buildDisplayName(u) : participants[i].user_id,
                canPost: participants[i].canPost !== false,
            };
        }
    }

    const activePoll = await getActivePoll(d.id);
    const poll =
        canViewContent && activePoll && activePoll.poll
            ? {
                  id: activePoll.id,
                  question: activePoll.poll.question,
                  active: activePoll.poll.active !== false,
                  createdAt: activePoll.createdAt,
              }
            : null;

    let addableMembers = [];
    const canEditParticipants = authUser.role === "admin" || isOwner;

    if (canEditParticipants && d.isPrivate) {
        const buildingMembers = listMembers(d.buildingId, authUser);
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
        body: canViewContent ? d.body : "",
        participants,
        poll,
        addableMembers,
    };
}

export function closeDiscussion(id, authUser) {
    const d = assertDiscussion(id);
    const roleInB = getRoleInBuilding(authUser.sub, d.buildingId);
    const isOwner = d.ownerId === authUser.sub;

    if (!(authUser.role === "admin" || roleInB === "predstavnik" || isOwner)) {
        throw new AppError(
            "Samo predstavnik, admin ili inicijator može zatvoriti raspravu",
            403
        );
    }
    d.status = "closed";
    return d;
}

export function reopenDiscussion(id, authUser) {
    const d = assertDiscussion(id);
    const roleInB = getRoleInBuilding(authUser.sub, d.buildingId);
    const isOwner = d.ownerId === authUser.sub;

    if (!(authUser.role === "admin" || roleInB === "predstavnik" || isOwner)) {
        throw new AppError(
            "Samo predstavnik, admin ili inicijator može otvoriti raspravu",
            403
        );
    }
    d.status = "open";
    return d;
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
