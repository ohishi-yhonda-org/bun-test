import { createRoute, z, RouteHandler } from "@hono/zod-openapi";
import { sqliteTestListUsers, ErrorResponseSchema, NullResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { users } from "../db/schema";

export const sqliteTestAddRoute = createRoute({
    method: "post",
    path: "/",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: sqliteTestListUsers,
                },
            },
        },
    },
    responses: {
        200: {
            description: "User added successfully",
            content: {
                "application/json": {
                    schema: NullResponseSchema,
                },
            },
        },
        500: {
            description: "Internal Server Error",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

type sqliteTestListUsers = z.infer<typeof sqliteTestListUsers>;

export const sqliteTestAddHandler: RouteHandler<typeof sqliteTestAddRoute, ENV> = async (c) => {
    const sqlite = new Database('sqlite.db');
    const db = drizzle({ client: sqlite });
    const userData = await c.req.json<sqliteTestListUsers>();

    try {
        await db.insert(users).values(userData);
        return c.json({}, 200);
    } catch (error) {
        console.error('Error adding user:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
}