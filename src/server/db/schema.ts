import { boolean, index, integer, jsonb, pgTable, primaryKey, real, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { VektorDNA } from "@/features/lab/schemas/dna";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("sessions_user_idx").on(table.userId)]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("accounts_user_idx").on(table.userId)]);

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("profiles_username_ci").on(table.username)]);

export const vektors = pgTable("vektors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
  anonymousSessionId: text("anonymous_session_id"),
  name: text("name").notNull(),
  description: text("description"),
  archetype: text("archetype").notNull(),
  dnaVersion: integer("dna_version").notNull().default(1),
  dna: jsonb("dna").$type<VektorDNA>().notNull(),
  previewImageUrl: text("preview_image_url"),
  previewVideoUrl: text("preview_video_url"),
  visibility: text("visibility").notNull().default("public"),
  status: text("status").notNull().default("draft"),
  generation: integer("generation").notNull().default(1),
  viewCount: integer("view_count").notNull().default(0),
  reactionCount: integer("reaction_count").notNull().default(0),
  remixCount: integer("remix_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (table) => [index("vektors_explore_idx").on(table.status, table.publishedAt), index("vektors_owner_idx").on(table.ownerId), index("vektors_anonymous_idx").on(table.anonymousSessionId)]);

export const vektorParents = pgTable("vektor_parents", {
  childId: uuid("child_id").notNull().references(() => vektors.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").notNull().references(() => vektors.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
  weight: real("weight").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.childId, table.parentId] }), index("parents_parent_idx").on(table.parentId)]);

export const vektorReactions = pgTable("vektor_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  vektorId: uuid("vektor_id").notNull().references(() => vektors.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  anonymousSessionId: text("anonymous_session_id"),
  type: text("type").notNull().default("pulse"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("reactions_vektor_idx").on(table.vektorId), uniqueIndex("reactions_user_unique").on(table.vektorId, table.userId), uniqueIndex("reactions_anon_unique").on(table.vektorId, table.anonymousSessionId)]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  vektorId: uuid("vektor_id").notNull().references(() => vektors.id, { onDelete: "cascade" }),
  reporterUserId: text("reporter_user_id").references(() => users.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("reports_status_idx").on(table.status, table.createdAt)]);
