import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { assertDiscussion } from "./discussionsService.js";

export async function getActivePoll(discussionId) {
    const { data: poll } = await db
        .from("poll")
        .select("*")
        .eq("discussion_id", discussionId)
        .eq("closed", false)
        .order("created_at", { ascending: false })
        .single();

    return poll || null;
}

export async function startPoll(discussionId, user, question) {
    const d = await assertDiscussion(discussionId);

    if (!question || !question.trim()) {
        throw new AppError("Pitanje je obavezno", 400);
    }
    if (d.closed === true) {
        throw new AppError("Rasprava je zatvorena", 400);
    }

    const { data: userDatabase } = await db
        .from("app_user")
        .select("*")
        .eq("email", user.email)
        .single();

    const isOwner = d.owner_id === userDatabase.id;
    const isAdmin = userDatabase.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new AppError("Samo inicijator (ili admin) može pokrenuti glasanje", 403);
    }

    const { data: msg } = await db
        .from("poll")
        .insert({
            discussion_id: discussionId,
            author_id: userDatabase.id,
            question: question.trim(),
            closed: false,
        })
        .select()
        .single();

    return msg;
}

export async function cancelPoll(discussionId, user) {
    const d = await assertDiscussion(discussionId);
    const poll = await getActivePoll(discussionId);

    if (!poll) {
        throw new AppError("Nema aktivne ankete", 400);
    }

    const { data: userDatabase } = await db
        .from("app_user")
        .select("*")
        .eq("email", user.email)
        .single();

    const isOwner = d.owner_id === userDatabase.user_id;
    const isAdmin = userDatabase.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new AppError("Samo inicijator (ili admin) može obrisati anketu", 403);
    }

    await db.from("poll").update({ closed: true }).eq("id", poll.id);

    return { ok: true };
}
