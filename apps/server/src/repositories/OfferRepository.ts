import { db } from '../db'
import { offers, listings, users } from '../db/schema'
import { eq, desc, and } from 'drizzle-orm'

export class OfferRepository {
    static async create(data: { listingId: number; buyerId: string; amount: number }) {
        return await db.insert(offers).values({
            listingId: data.listingId,
            buyerId: data.buyerId,
            amount: data.amount,
        }).returning()
    }

    static async findByListingId(listingId: number) {
        return await db.select({
            id: offers.id,
            amount: offers.amount,
            status: offers.status,
            createdAt: offers.createdAt,
            buyerId: offers.buyerId,
            buyerName: users.name,
            buyerAvatar: users.avatarUrl,
        })
            .from(offers)
            .leftJoin(users, eq(offers.buyerId, users.id))
            .where(eq(offers.listingId, listingId))
            .orderBy(desc(offers.createdAt))
    }

    static async findIncomingOffers(sellerId: string) {
        // Find offers on listings created by this seller
        return await db.select({
            id: offers.id,
            amount: offers.amount,
            status: offers.status,
            createdAt: offers.createdAt,
            listingTitle: listings.title,
            listingId: listings.id,
            buyerName: users.name,
        })
            .from(offers)
            .innerJoin(listings, eq(offers.listingId, listings.id))
            .innerJoin(users, eq(offers.buyerId, users.id))
            .where(eq(listings.userId, sellerId))
            .orderBy(desc(offers.createdAt))
    }

    static async findOutgoingOffers(buyerId: string) {
        return await db.select({
            id: offers.id,
            amount: offers.amount,
            status: offers.status,
            listingTitle: listings.title,
            listingId: listings.id,
            sellerName: users.name,
        })
            .from(offers)
            .innerJoin(listings, eq(offers.listingId, listings.id))
            .innerJoin(users, eq(listings.userId, users.id))
            .where(eq(offers.buyerId, buyerId))
            .orderBy(desc(offers.createdAt))
    }

    static async findByIdWithSeller(offerId: number) {
        return await db.select({
            id: offers.id,
            amount: offers.amount,
            status: offers.status,
            listingTitle: listings.title,
            sellerStripeId: users.stripeAccountId,
        })
            .from(offers)
            .innerJoin(listings, eq(offers.listingId, listings.id))
            .innerJoin(users, eq(listings.userId, users.id))
            .where(eq(offers.id, offerId))
            .limit(1)
    }

    static async updateStatus(offerId: number, status: 'accepted' | 'declined') {
        return await db.update(offers)
            .set({ status })
            .where(eq(offers.id, offerId))
            .returning()
    }
}
