import { db } from '../db';
import { listings, users, userRelations } from '../db/schema';
import { eq, desc, and, or, isNotNull } from 'drizzle-orm';

export type CreateListingDTO = {
    userId: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
};

export class ListingRepository {
    static async create(data: CreateListingDTO) {
        return await db.insert(listings).values({
            userId: data.userId,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
            images: data.images,
        }).returning();
    }

    static async findAll(viewerId: string) {
        // Find all listings where the seller is a friend of the viewer
        // OR the seller IS the viewer (to see own listings)

        return await db.select({
            id: listings.id,
            title: listings.title,
            description: listings.description,
            price: listings.price,
            category: listings.category,
            images: listings.images,
            createdAt: listings.createdAt,
            userId: listings.userId,
            seller: {
                name: users.name,
                avatarUrl: users.avatarUrl,
            }
        })
            .from(listings)
            .innerJoin(users, eq(listings.userId, users.id))
            .leftJoin(userRelations, and(
                eq(listings.userId, userRelations.friendId),
                eq(userRelations.userId, viewerId)
            ))
            // Show listing if it's from a friend (relation exists) OR if it's mine
            .where(or(
                isNotNull(userRelations.userId),
                eq(listings.userId, viewerId)
            ))
            .orderBy(desc(listings.createdAt));
    }

    static async findByUserId(userId: string) {
        return await db.select().from(listings).where(eq(listings.userId, userId));
    }

    static async findById(id: number) {
        return await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    }

    static async update(id: number, userId: string, data: Partial<CreateListingDTO>) {
        return await db.update(listings)
            .set(data)
            .where(and(
                eq(listings.id, id),
                eq(listings.userId, userId) // Ensure ownership
            ))
            .returning();
    }

    static async delete(id: number, userId: string) {
        return await db.delete(listings)
            .where(and(
                eq(listings.id, id),
                eq(listings.userId, userId) // Ensure ownership
            ))
            .returning();
    }
}
