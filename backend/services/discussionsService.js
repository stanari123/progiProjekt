import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { userInBuilding } from "./buildingsService.js";

// helpers
export function buildDisplayName(user) {
    if (!user) return "(nepoznat)";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (full) return full;
    if (user.role === "admin") return "Administrator";
    return user.email || "(nepoznat)";
}

export async function userCanAccessDiscussion(discussion, authUser) {
    console.log("Checking access for user", authUser, "to discussion", discussion);

    // Check admin role from JWT first
    if (authUser.role === "admin") return true;

    let { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();
    console.log("Fetched user record:", user);

    // If user not found in database, deny access
    if (!user) return false;

    if (discussion.visibility === "javno") return true;

    if (user.role === "admin") return true;

    if (discussion.owner_id === user.id) return true;

    let { data: isParticipant } = await db
        .from("discussion_participant")
        .select("*")
        .eq("discussion_id", discussion.id)
        .eq("user_id", user.id)
        .maybeSingle();

    console.log("Is participant:", isParticipant);

    return !!isParticipant;
}

export async function assertDiscussion(id) {
    const getDiscussion = await db.from("discussion").select("*").eq("id", id).single();

    if (!getDiscussion) throw new AppError("Diskusija nije pronađena", 404);
    return getDiscussion.data;
}

export async function listDiscussions(authUser, buildingId) {
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const { data: userRecord } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (authUser.role !== "admin" && !userInBuilding(userRecord.id, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const discussionsArray = await db
        .from("discussion")
        .select("*")
        .eq("building_id", buildingId);

    for (const discussion of discussionsArray.data) {
        const owner = await db
            .from("app_user")
            .select("*")
            .eq("id", discussion.owner_id)
            .single();

        discussion.ownerName = owner.data.first_name + " " + owner.data.last_name;
    }

    return discussionsArray.data;
}

export async function createDiscussion(
    authUser,
    buildingId,
    title,
    body = "",
    isPrivate = false,
    participants = []
) {
    if (!title) throw new AppError("Naslov je obavezan", 400);
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const { data: userRecord } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (authUser.role !== "admin" && !userInBuilding(userRecord.id, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    // Create the discussion
    const newDiscussion = await db
        .from("discussion")
        .insert({
            title: title,
            building_id: buildingId,
            owner_id: userRecord.id,
            visibility: isPrivate ? "privatno" : "javno",
            status: "otvoreno",
            poll_description: body,
        })
        .select();

    if (newDiscussion.error) {
        console.error("Supabase insert error:", newDiscussion.error);
        throw new AppError(
            newDiscussion.error.message || "Greška pri stvaranju rasprave",
            500
        );
    }

    if (!newDiscussion.data || newDiscussion.data.length === 0) {
        console.error("No data returned from insert:", newDiscussion);
        throw new AppError("Greška pri stvaranju rasprave", 500);
    }

    const discussionId = newDiscussion.data[0].id;

    // Add participants if this is a private discussion
    if (isPrivate && Array.isArray(participants) && participants.length > 0) {
        // Get all building members
        const { data: members } = await db
            .from("building_membership")
            .select("*")
            .eq("building_id", buildingId);

        // Find user IDs that match the participant names
        const participantIds = [];
        for (const participant of participants) {
            const { data: userMatches } = await db
                .from("app_user")
                .select("*")
                .ilike("first_name", `%${participant.split(" ")[0]}%`);

            if (userMatches && userMatches.length > 0) {
                // Find exact match or first match in building members
                for (const userMatch of userMatches) {
                    const fullName =
                        `${userMatch.first_name} ${userMatch.last_name}`.trim();
                    if (fullName === participant) {
                        const isMemberOfBuilding = members.some(
                            (m) => m.user_id === userMatch.id
                        );
                        if (
                            isMemberOfBuilding &&
                            !participantIds.includes(userMatch.id)
                        ) {
                            participantIds.push(userMatch.id);
                        }
                        break;
                    }
                }
            }
        }

        // Insert participants
        if (participantIds.length > 0) {
            const participantRecords = participantIds.map((userId) => ({
                discussion_id: discussionId,
                user_id: userId,
                can_post: true,
            }));

            await db.from("discussion_participant").insert(participantRecords);
        }
    }

    return newDiscussion.data;
}
