import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { nanoid } from "nanoid";
import { userInBuilding } from "./buildingsService.js";

// helpers
export function buildDisplayName(user) {
    if (!user) return "(nepoznat)";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (full) return full;
    if (user.role === "admin") return "Administrator";
    return user.email || "(nepoznat)";
}

export function userCanAccessDiscussion(discussion, authUser) {
    if (!discussion.isPrivate) return true;

    if (authUser.role === "admin") return true;

    if (discussion.ownerId === authUser.sub) return true;

    const isParticipant = db.discussionParticipants.some(
        (p) => p.discussionId === discussion.id && p.userId === authUser.sub
    );
    return isParticipant;
}

export async function assertDiscussion(id) {
    const getDiscussion = await db.from("discussion").select("*").eq("id", id);
    if (!getDiscussion) throw new AppError("Diskusija nije pronađena", 404);
    return getDiscussion;
}

export async function listDiscussions(authUser, buildingId) {
    if (!buildingId) throw new AppError("buildingId je obavezan", 400);

    const { data: userRecord } = await db
        .from("app_user")
        .select("*")
        .eq("email", authUser.email)
        .single();

    if (
        authUser.role !== "admin" &&
        !userInBuilding(userRecord.id, buildingId)
    ) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const discussionsArray = await db
        .from("discussion")
        .select("*")
        .eq("building_id", buildingId);

    console.log("Dohvaćene diskusije:", discussionsArray.data);

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

    if (
        authUser.role !== "admin" &&
        !userInBuilding(authUser.sub, buildingId)
    ) {
        throw new AppError("Zabranjen pristup zgradi", 403);
    }

    const { data: userId } = await db
        .from("app_user")
        .select("id")
        .eq("email", authUser.email)
        .single();

    const newDiscussion = await db.from("discussion").insert({
        title: title,
        building_id: buildingId,
        owner_id: userId.id,
        visibility: isPrivate ? "privatno" : "javno",
        status: "otvoreno",
        poll_description: body,
    });
}
