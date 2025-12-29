import { pgTable, serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    googleId: text("google_id").unique(),
    stripeAccountId: text("stripe_account_id"), // Connect Account ID
    createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(), // stored in cents
    category: text("category").notNull(),
    images: text("images").array(),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const userRelations = pgTable("user_relations", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    friendId: uuid("friend_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id").references(() => listings.id).notNull(),
    senderId: uuid("sender_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const offers = pgTable("offers", {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id").references(() => listings.id).notNull(),
    buyerId: uuid("buyer_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(), // stored in cents
    status: text("status").default("pending").notNull(), // pending, accepted, declined, paid
    createdAt: timestamp("created_at").defaultNow(),
});
