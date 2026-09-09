import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isPremium: boolean("is_premium").default(false),
  plan: text("plan").default("free"),
  status: text("status").default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeLatestSessionId: text("stripe_latest_session_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerEmail: text("customer_email"),
  amountTotal: integer("amount_total"),
  currency: text("currency").default("usd"),
  paymentStatus: text("payment_status").default("paid"),
  eventType: text("event_type").default("checkout.session.completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
