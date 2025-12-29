import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UserRepository {
    static async upsert(data: { id: string; email: string; name?: string; avatarUrl?: string }) {
        return await db.insert(users).values({
            id: data.id,
            email: data.email,
            name: data.name,
            avatarUrl: data.avatarUrl,
        }).onConflictDoUpdate({
            target: users.id,
            set: {
                email: data.email,
                name: data.name,
                avatarUrl: data.avatarUrl,
            }
        }).returning();
    }

    static async findById(id: string) {
        return await db.select().from(users).where(eq(users.id, id)).limit(1);
    }
}
