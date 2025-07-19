// src/db/schema.ts
import { password } from 'bun';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    age: integer('age'),
    password: text('password').notNull(),
});

export const products = sqliteTable('products', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    price: integer('price').notNull(),
});