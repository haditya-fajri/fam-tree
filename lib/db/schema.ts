import { pgTable, uuid, varchar, text, timestamp, char, date, boolean, check, primaryKey, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  name: varchar("name", { length: 100 }),
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
    unique("unique_pair").on(sql`LEAST(${table.personA}::text, ${table.personB}::text)`, sql`GREATEST(${table.personA}::text, ${table.personB}::text)`),
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
