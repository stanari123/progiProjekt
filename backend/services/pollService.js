import { nanoid } from "nanoid";
import { db } from "../data/memory.js";
import { AppError } from "../utils/AppError.js";
import { assertDiscussion } from "./discussionsService.js";

export function getActivePoll(discussionId) {
    return null; // Temporary disable polls
    const d = assertDiscussion(discussionId);
    const polls = db.messages
        .filter(
            (m) =>
                m.discussionId === d.id &&
                m.type === "poll" &&
                m.poll &&
                m.poll.active !== false
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return polls[0] || null;
}

export function startPoll(discussionId, user, question) {
    const d = assertDiscussion(discussionId);

    if (!question || !question.trim()) {
        throw new AppError("Pitanje je obavezno", 400);
    }
    if (d.status === "closed") {
        throw new AppError("Rasprava je zatvorena", 400);
    }

    const isOwner = d.ownerId === user.sub;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new AppError("Samo inicijator (ili admin) može pokrenuti glasanje", 403);
    }

    if (getActivePoll(discussionId)) {
        throw new AppError("Već postoji aktivna anketa", 400);
    }

    const msg = {
        id: nanoid(),
        discussionId,
        authorId: user.sub,
        type: "poll",
        body: question.trim(),
        poll: {
            active: true,
            question: question.trim(),
        },
        createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    return msg;
}

export function cancelPoll(discussionId, user) {
    const d = assertDiscussion(discussionId);
    const poll = getActivePoll(discussionId);
    if (!poll) {
        throw new AppError("Nema aktivne ankete", 400);
    }

    const isOwner = d.ownerId === user.sub;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new AppError("Samo inicijator (ili admin) može obrisati anketu", 403);
    }

    poll.poll.active = false;
    db.votes = db.votes.filter((v) => v.discussionId !== discussionId);

    return { ok: true };
}
