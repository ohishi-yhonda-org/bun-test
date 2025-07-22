import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { sqliteTestListUsersWOPasswordArraySchema, sqliteTestListUsersWOPasswordSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../db/schema";
import { keyof } from "zod";

export const sqliteTestListRoute = createRoute({

    method: "get",
    path: "/",
    responses: {
        200: {
            description: "SQLite Test List",
            content: {
                "application/json": {
                    schema: sqliteTestListUsersWOPasswordArraySchema,
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

type sqliteTestListUsersWOPasswordArraySchema = z.infer<typeof sqliteTestListUsersWOPasswordArraySchema>;

export const sqliteTestListHandler: RouteHandler<typeof sqliteTestListRoute, ENV> = async (c) => {
    const client = createClient({
        url: process.env.NODE_ENV === "dev" ? "file:sqlite.db" : "file:..\\sqlite.db"
    });
    console.log('SQLite Test List Handler');
    const db = drizzle(client);
    try {
        const result = await db.select().from(users).all();
        const parsedResult = sqliteTestListUsersWOPasswordArraySchema.parse(result);
        return c.json(parsedResult, 200);
        // return c.json(result, 200);
    } catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }


}