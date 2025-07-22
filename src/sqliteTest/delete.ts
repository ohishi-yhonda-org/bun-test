import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { sqliteTestListUsersWOPasswordArraySchema, sqliteTestListUsersWOPasswordSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
import { basicAuth } from "hono/basic-auth";
export const sqliteTestListDeleteRoute = createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ sakuraBasicAuth: [] }],
    request: {
        params: z.object({
            id: z.string(),
        }).openapi({ // ここで .openapi() を1回だけ呼び出す
            param: { // OpenAPIパラメータの定義
                name: "id", // パスパラメータの名前と一致させる
                in: "path", // パスパラメータであることを明示
                required: true, // パスパラメータは通常必須
                description: "削除するユーザーのID。",
                example: "1",
            },
            type: "string", // ここでパラメータの型を指定
            // 必要であれば、OpenAPIスキーマに関する追加プロパティをここに記述できますが、
            // パラメータ自体は上記 `param` フィールドで定義されます。
            // 例: type: "string" は 'param' 内で推論されるため不要な場合が多い
        }),
    },
    responses: {
        200: {
            description: "User deleted successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }).openapi("deleteNullResponseSchema", {
                        description: "This response is returned when a user is deleted successfully.",
                        type: "object",
                        properties: {
                            message: { type: "string", description: "Success message" }
                        },
                    }),
                },
            },
        },
        404: {
            description: "User not found",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
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

export const sqliteTestListDeleteHandler: RouteHandler<typeof sqliteTestListDeleteRoute, ENV> = async (c) => {
    const client = createClient({
        url: process.env.NODE_ENV === "dev" ? "file:sqlite.db" : "file:..\\sqlite.db"
    });
    const db = drizzle(client);
    console.log('SQLite Test List Delete Handler');
    const { id } = c.req.param();
    console.log('SQLite Test List Delete Handler', 'ID:', id);
    try {
        const result = await db.delete(users).where(eq(users.id, Number(id))).run();
        if (result.rowsAffected === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ message: 'User deleted successfully' }, 200);
    } catch (error) {
        return handleSqliteError(error, c);
    }
};