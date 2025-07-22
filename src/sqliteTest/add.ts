import { createRoute, z, RouteHandler } from "@hono/zod-openapi";
import { sqliteTestListUsersAddSchema, ErrorResponseSchema, NullResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../db/schema";
import { handleSqliteError } from "../utils/sqliteErrorHandler";

export const sqliteTestAddRoute = createRoute({
    method: "post",
    path: "/add",
    security: [{ sakuraBasicAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: sqliteTestListUsersAddSchema,
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
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        409: {
            description: "Conflict: User already exists",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
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

type sqliteTestListUsersAddSchema = z.infer<typeof sqliteTestListUsersAddSchema>;

export const sqliteTestAddHandler: RouteHandler<typeof sqliteTestAddRoute, ENV> = async (c) => {
    const client = createClient({
        url: process.env.NODE_ENV === "dev" ? "file:sqlite.db" : "file:..\\sqlite.db"
    });
    const db = drizzle(client);
    try {
        const userData = await c.req.json<sqliteTestListUsersAddSchema>();
        const bcrypt = await import('bcryptjs');
        // パスワードをハッシュ化
        userData.password = await bcrypt.hash(userData.password, 10);
        const parsedData = sqliteTestListUsersAddSchema.parse(userData);
        await db.insert(users).values(parsedData);
        return c.json({}, 200);
    } catch (error: any) {
        console.error('Error adding user:', error);
        return handleSqliteError(error, c);
    }
}