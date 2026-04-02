import { pgTable, uuid, varchar, text, timestamp, char, date, boolean, check, primaryKey, unique, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  emailVerified: timestamp("emailVerified"),
  name: varchar("name", { length: 100 }),
  image: text("image"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  nickname: varchar("nickname", { length: 50 }),
  gender: char("gender", { length: 1 }), // M or F
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  birthPlace: varchar("birth_place", { length: 100 }),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const partnerships = pgTable("partnerships", {
  id: uuid("id").primaryKey().defaultRandom(),
  personA: uuid("person_a").notNull().references(() => persons.id),
  personB: uuid("person_b").notNull().references(() => persons.id),
  marriedAt: date("married_at"),
  divorcedAt: date("divorced_at"),
}, (table) => {
  return [
    check("partnerships_no_self", sql`${table.personA} <> ${table.personB}`),
    uniqueIndex("idx_partnerships_unique_pair").on(sql`LEAST(${table.personA}::text, ${table.personB}::text), GREATEST(${table.personA}::text, ${table.personB}::text)`),
  ];
});

export const parentChild = pgTable("parent_child", {
  parentId: uuid("parent_id").notNull().references(() => persons.id),
  childId: uuid("child_id").notNull().references(() => persons.id),
  isAdopted: boolean("is_adopted").default(false),
}, (table) => {
  return [
    primaryKey({ columns: [table.parentId, table.childId] }),
    check("parent_child_no_self", sql`${table.parentId} <> ${table.childId}`),
  ];
});

export const trees = pgTable("trees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ownerId: uuid("owner_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const treeMembers = pgTable("tree_members", {
  treeId: uuid("tree_id").notNull().references(() => trees.id, { onDelete: "cascade" }),
  personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  isRoot: boolean("is_root").default(false),
}, (table) => {
  return [
    primaryKey({ columns: [table.treeId, table.personId] })
  ];
});

// NextAuth v5 tables
export const accounts = pgTable("accounts", {
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] })
]);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.identifier, table.token] })
]);
