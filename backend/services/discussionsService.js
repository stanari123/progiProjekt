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
    // console.log("Checking access for user", authUser, "to discussion", discussion);
    let { data: user } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email);

    if (discussion.visibility === "javno") return true;

    if (user.role === "admin") return true;

    if (discussion.owner_id === user.id) return true;

    let { data: isParticipant } = await db
        .from("discussion_participant")
        .select("*")
        .eq("discussion_id", discussion.id)
        .eq("user_id", user.id);

    return isParticipant;
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
    isPrivate = false
) {
    if (!title) throw new AppError("Naslov je obavezan", 400);
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const { data: userId } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (authUser.role !== "admin" && !userInBuilding(userId.id, buildingId)) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const newDiscussion = await db.from("discussion").insert({
        title: title,
        building_id: buildingId,
        owner_id: userId.id,
        visibility: isPrivate ? "privatno" : "javno",
        status: "otvoreno",
        poll_description: body,
    });

    return newDiscussion.data;
}
