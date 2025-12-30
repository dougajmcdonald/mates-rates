import { db } from '../db';
import { userRelations, users } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';

export class SocialRepository {
    static async createFriendship(userId: string, friendId: string) {
        // Create bi-directional relationship (or just two rows? Let's do two rows for simplicity or one checked both ways)
        // Requirement: "Social link between sharee and sharer". Usually implies bi-directional access.
        // Let's Insert two rows to make querying easier: A->B and B->A

        // Check if exists A->B
        const exists = await db.select().from(userRelations).where(
            and(eq(userRelations.userId, userId), eq(userRelations.friendId, friendId))
        );

        if (exists.length > 0) return;

        // Insert A->B
        await db.insert(userRelations).values({
            userId: userId,
            friendId: friendId
        });

        // Insert B->A
        await db.insert(userRelations).values({
            userId: friendId,
            friendId: userId
        });
    }

    static async getFriends(userId: string) {
        return await db.select({
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl
        })
            .from(userRelations)
            .innerJoin(users, eq(userRelations.friendId, users.id))
            .where(eq(userRelations.userId, userId));
    }

    static async getFriendsWithStats(userId: string) {
        // Fetch friends first
        const friends = await this.getFriends(userId);

        // For each friend, count their active listings
        // optimize: could be a join, but map is easier for now with Drizzle optional helpers
        // actually, let's just loop for MVP or do a group by

        const friendsWithStats = await Promise.all(friends.map(async (friend) => {
            // We can use db.execute or specific count query
            // Let's use the listings table import
            const { listings } = await import('../db/schema');
            const { count } = await import('drizzle-orm');

            const result = await db.select({ count: count() })
                .from(listings)
                .where(and(
                    eq(listings.userId, friend.id),
                    eq(listings.status, 'active')
                ));

            return {
                ...friend,
                listingCount: result[0].count
            };
        }));

        return friendsWithStats;
    }
}
