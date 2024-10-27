import {
  pgTable,
  pgEnum,
  uuid,
  timestamp,
  text,
  jsonb,
  boolean,
  bigint,
  integer,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";

export const keyStatus = pgEnum("key_status", [
  "expired",
  "invalid",
  "valid",
  "default",
]);
export const keyType = pgEnum("key_type", [
  "stream_xchacha20",
  "secretstream",
  "secretbox",
  "kdf",
  "generichash",
  "shorthash",
  "auth",
  "hmacsha256",
  "hmacsha512",
  "aead-det",
  "aead-ietf",
]);
export const factorStatus = pgEnum("factor_status", ["verified", "unverified"]);
export const factorType = pgEnum("factor_type", ["webauthn", "totp"]);
export const aalLevel = pgEnum("aal_level", ["aal3", "aal2", "aal1"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "plain",
  "s256",
]);
export const pricingType = pgEnum("pricing_type", ["recurring", "one_time"]);
export const pricingPlanInterval = pgEnum("pricing_plan_interval", [
  "year",
  "month",
  "week",
  "day",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "unpaid",
  "past_due",
  "incomplete_expired",
  "incomplete",
  "canceled",
  "active",
  "trialing",
]);
export const equalityOp = pgEnum("equality_op", [
  "in",
  "gte",
  "gt",
  "lte",
  "lt",
  "neq",
  "eq",
]);
export const action = pgEnum("action", [
  "ERROR",
  "TRUNCATE",
  "DELETE",
  "UPDATE",
  "INSERT",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  workspace_owner: uuid("workspace_owner").notNull(),
  title: text("title").notNull(),
  icon_id: text("icon_id").notNull(),
  data: text("data"),
  in_trash: text("in_trash"),
  logo: text("logo"),
  banner_url: text("banner_url"),
});

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  title: text("title").notNull(),
  icon_id: text("icon_id").notNull(),
  data: text("data"),
  in_trash: text("in_trash"),
  banner_url: text("banner_url"),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
});

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  title: text("title").notNull(),
  icon_id: text("icon_id").notNull(),
  data: text("data"),
  in_trash: text("in_trash"),
  banner_url: text("banner_url"),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  folder_id: uuid("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  billing_address: jsonb("billing_address"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  payment_method: jsonb("payment_method"),
  email: text("email"),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().notNull(),
  stripe_customer_id: text("stripe_customer_id"),
});

export const prices = pgTable("prices", {
  id: text("id").primaryKey().notNull(),
  product_id: text("product_id").references(() => products.id),
  active: boolean("active"),
  description: text("description"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  unit_amount: bigint("unit_amount", { mode: "number" }),
  currency: text("currency"),
  type: pricingType("type"),
  interval: pricingPlanInterval("interval"),
  interval_count: integer("interval_count"),
  trial_period_days: integer("trial_period_days"),
  metadata: jsonb("metadata"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey().notNull(),
  active: boolean("active"),
  name: text("name"),
  description: text("description"),
  image: text("image"),
  metadata: jsonb("metadata"),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().notNull(),
  user_id: uuid("user_id").notNull(),
  status: subscriptionStatus("status"),
  metadata: jsonb("metadata"),
  price_id: text("price_id").references(() => prices.id),
  quantity: integer("quantity"),
  cancel_at_period_end: boolean("cancel_at_period_end"),
  created: timestamp("created", { withTimezone: true, mode: "string" })
    .default(sql`now()`)
    .notNull(),
  current_period_start: timestamp("current_period_start", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  current_period_end: timestamp("current_period_end", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  ended_at: timestamp("ended_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  cancel_at: timestamp("cancel_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  canceled_at: timestamp("canceled_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_start: timestamp("trial_start", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_end: timestamp("trial_end", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
});

export const collaborators = pgTable("collaborators", {
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.product_id],
    references: [products.id],
  }),
}));
