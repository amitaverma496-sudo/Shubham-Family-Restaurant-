import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  phone: text('phone').notNull(),
  lastLogin: timestamp('last_login').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
