import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { sqliteTestListUsersArray, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { users } from "../db/schema";

export const sqliteTestListRoute = createRoute({

    method: "get",
    path: "/",
    responses: {
        200: {
            description: "SQLite Test List",
            content: {
                "application/json": {
                    schema: sqliteTestListUsersArray,
                },
            },
        },
        500: {
            description: "Internal Server Error",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },

            }
        }
    }
})

export const sqliteTestListHandler: RouteHandler<typeof sqliteTestListRoute, ENV> = async (c) => {
    const sqlite = new Database('sqlite.db');
    const db = drizzle({ client: sqlite });
    try {
        const result = await db.select().from(users).all();
        return c.json(result, 200);
    } catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }


}