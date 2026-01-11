import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { assertDiscussion } from "./discussionsService.js";

export async function castVote(pollId, user, value) {
    if (!["yes", "no"].includes(value)) {
        throw new AppError("value mora biti 'yes' ili 'no'", 400);
    }

    const { data: dbUser } = await db
        .from("app_user")
        .select("*")
        .eq("email", user.email)
        .single();

    const userId = dbUser.id;

    if (!userId) {
        console.error("User ID missing from JWT:", user);
        throw new AppError("Neispravna autentifikacija", 401);
    }

    if (value === "yes") {
        value = "da";
    }
    if (value === "no") {
        value = "ne";
    }

    const { data: existingVote } = await db
        .from("vote")
        .select("*")
        .eq("poll_id", pollId)
        .eq("user_id", userId)
        .maybeSingle();

    if (existingVote) {
        if (existingVote.value !== value) {
            await db.from("vote").delete().eq("poll_id", pollId).eq("user_id", userId);
        } else {
            return { message: "Glas zabilježen", value };
        }
    }

    const { data: newVote } = await db
        .from("vote")
        .insert({
            poll_id: pollId,
            user_id: userId,
            value,
        })
        .select()
        .single();

    return { message: "Glas zabilježen", value, vote: newVote };
}

export async function getVoteSummary(pollId, user) {
    const { data: dbUser } = await db
        .from("app_user")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

    const userId = dbUser?.id;

    const { data: poll, error: pollError } = await db
        .from("poll")
        .select("*")
        .eq("id", pollId)
        .maybeSingle();

    if (pollError || !poll) {
        console.error("Poll lookup failed:", pollError, "pollId:", pollId);
        throw new AppError("Anketa nije pronađena", 404);
    }

    const d = await assertDiscussion(poll.discussion_id);

    const { data: allVotes } = await db.from("vote").select("*").eq("poll_id", pollId);

    const { data: members } = await db
        .from("building_membership")
        .select("*")
        .eq("building_id", d.building_id)
        .eq("user_role", "suvlasnik");

    const totalOwners = (members || []).length || 1;

    const ownerVotes = (allVotes || []).filter((v) => {
        return members?.some((m) => m.user_id === v.user_id);
    });

    const yes = ownerVotes.filter((v) => v.value === "yes" || v.value === "da").length;
    const no = ownerVotes.filter((v) => v.value === "no" || v.value === "ne").length;

    const thresholdReached = yes > totalOwners / 4;
    let mine = (allVotes || []).find((v) => v.user_id === userId)?.value || null;

    if (mine === "da") mine = "yes";
    if (mine === "ne") mine = "no";

    return {
        total: ownerVotes.length,
        yes,
        no,
        totalOwners,
        thresholdReached,
        currentUserVote: mine,
    };
}
