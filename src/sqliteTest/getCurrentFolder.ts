import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { NullResponseSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
import * as fs from 'fs';
import * as os from 'os';
import * as iconv from 'iconv-lite'; // iconv-lite をインポート

const filepath = `ryohi.pdf`;
export const sqliteTestGetCurrentFolderRoute = createRoute({
    method: "get",
    path: "/currentFolder",
    responses: {
        200: {
            description: "Current folder retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        currentFolder: z.string().min(2).max(100),
                    }).openapi({
                        title: "CurrentFolderResponse",
                        type: "object",
                        description: "Response containing the current folder path",
                    }),
                },
            },
        },
        404: {
            description: "Current folder not found",
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

export const sqliteTestGetCurrentFolderHandler: RouteHandler<typeof sqliteTestGetCurrentFolderRoute, ENV> = async (c) => {
    try {
        // 現在のフォルダを取得
        const currentFolder = process.cwd();

        // フォルダが存在するか確認
        if (!fs.existsSync(currentFolder)) {
            return c.json({ error: "Current folder not found" }, 404);
        }

        const files = fs.readdirSync(currentFolder);
        console.log(files);

        // フォルダのパスを返す
        return c.json({ currentFolder }, 200);
    } catch (error) {
        // エラーハンドリング
        return c.json({ error: "Internal Server Error" }, 500);
    }
}