import { pgTable, serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    googleId: text("google_id").unique(),
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
