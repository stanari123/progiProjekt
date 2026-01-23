import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { assertDiscussion, userCanAccessDiscussion } from "./discussionsService.js";

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

    const { data: poll, error: pollError } = await db
        .from("poll")
        .select("*")
        .eq("id", pollId)
        .maybeSingle();

    if (pollError) {
        console.error("Poll lookup query error:", pollError, "pollId:", pollId);
        throw new AppError("Greška pri dohvaćanju ankete", 500);
    }
    if (!poll) {
        throw new AppError("Anketa nije pronađena", 404);
    }

    const d = await assertDiscussion(poll.discussion_id);
    const canAccess = await userCanAccessDiscussion(d, user);
    if (!canAccess) {
        throw new AppError("Zabranjeno glasanje u ovoj diskusiji", 403);
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

    if (pollError) {
        console.error("Poll lookup query error:", pollError, "pollId:", pollId);
        throw new AppError("Greška pri dohvaćanju ankete", 500);
    }

    if (!poll) {
        console.error("Poll not found:", "pollId:", pollId);
        throw new AppError("Anketa nije pronađena", 404);
    }

    let d;
    try {
        d = await assertDiscussion(poll.discussion_id);
    } catch (err) {
        console.error("Discussion lookup failed:", err, "discussion_id:", poll.discussion_id);
        throw err;
    }

    const { data: allVotes } = await db.from("vote").select("*").eq("poll_id", pollId);

    let eligibleOwners = [];
    let eligibleVoters = [];


    if (d.visibility === "privatno") {

        const { data: participants, error: pErr } = await db
            .from("discussion_participant")
            .select("user_id")
            .eq("discussion_id", d.id);

        if (pErr) {
            console.error("discussion_participant error:", pErr);
            throw new AppError("Greška pri dohvaćanju članova diskusije", 500);
        }

        const memberIds = new Set([
            d.owner_id,
            ...(participants || []).map((r) => r.user_id),
        ]);

        const ids = Array.from(memberIds).filter(Boolean);

        if (ids.length > 0) {

            const { data: owners, error: oErr } = await db
                .from("building_membership")
                .select("user_id")
                .eq("building_id", d.building_id)
                .eq("user_role", "suvlasnik")
                .in("user_id", ids);

            if (oErr) {
                console.error("building_membership (private owners) error:", oErr);
                throw new AppError("Greška pri dohvaćanju suvlasnika diskusije", 500);
            }

            const { data: voters, error: vErr } = await db
                .from("building_membership")
                .select("user_id")
                .eq("building_id", d.building_id)
                .in("user_role", ["suvlasnik", "predstavnik"])
                .in("user_id", ids);

            if (vErr) {
                console.error("building_membership (private voters) error:", vErr);
                throw new AppError("Greška pri dohvaćanju glasača diskusije", 500);
            }

            eligibleOwners = owners || [];
            eligibleVoters = voters || [];
        } else {
            eligibleOwners = [];
            eligibleVoters = [];
        }

    } else {
        const { data: owners, error: oErr } = await db
            .from("building_membership")
            .select("user_id")
            .eq("building_id", d.building_id)
            .eq("user_role", "suvlasnik");

        if (oErr) {
            console.error("building_membership owners error:", oErr);
            throw new AppError("Greška pri dohvaćanju suvlasnika zgrade", 500);
        }

        const { data: voters, error: vErr } = await db
            .from("building_membership")
            .select("user_id")
            .eq("building_id", d.building_id)
            .in("user_role", ["suvlasnik", "predstavnik"]);

        if (vErr) {
            console.error("building_membership voters error:", vErr);
            throw new AppError("Greška pri dohvaćanju članova zgrade", 500);
        }

        eligibleOwners = owners || [];
        eligibleVoters = voters || [];

    }

    const totalOwners = (eligibleOwners || []).length || 1;

    const countedVotes = (allVotes || []).filter((v) => {
        return eligibleVoters?.some((m) => m.user_id === v.user_id);
    });

    const ownerVotes = (allVotes || []).filter((v) => {
        return eligibleOwners?.some((m) => m.user_id === v.user_id);
    });

    const yes = countedVotes.filter((v) => v.value === "yes" || v.value === "da").length;
    const no = countedVotes.filter((v) => v.value === "no" || v.value === "ne").length;

    const ownerYes = ownerVotes.filter((v) => v.value === "yes" || v.value === "da").length;
    const thresholdReached = ownerYes > totalOwners / 4;

    let mine = (allVotes || []).find((v) => v.user_id === userId)?.value || null;

    if (mine === "da") mine = "yes";
    if (mine === "ne") mine = "no";

    return {
        total: countedVotes.length,
        yes,
        no,
        totalOwners,
        thresholdReached,
        currentUserVote: mine,
    };
}
