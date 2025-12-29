import { db } from '../db'
import { messages } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { users } from '../db/schema'

export class MessageRepository {
    static async create(data: { listingId: number; senderId: string; content: string }) {
        return await db.insert(messages).values({
            listingId: data.listingId,
            senderId: data.senderId,
            content: data.content,
        }).returning()
    }

    static async findByListingId(listingId: number) {
        return await db.select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
            senderName: users.name,
            senderAvatar: users.avatarUrl,
        })
            .from(messages)
            .leftJoin(users, eq(messages.senderId, users.id))
            .where(eq(messages.listingId, listingId))
            .orderBy(desc(messages.createdAt))
    }
}
