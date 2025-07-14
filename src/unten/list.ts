import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { ENV } from "..";
import { sqlSvMiddleware } from "../middleware/sqlsv";
import { checkPrismaClient, createPrismaNotFoundResponse } from "../utils/prisma";
import {
    UntenNippouMeisaiListResponseSchema, ErrorResponseSchema,
    BaseUntenNippouMeisaiSchema
} from "../openApi/schema";
// 基本のZodスキーマ（UntenNippouMeisaiSchemaをベースにOpenAPI定義を追加）


// レスポンススキーマの定義


export const untenlistRoute = createRoute({
    method: "get",
    path: "/",
    middleware: [sqlSvMiddleware],
    responses: {
        200: {
            description: "運転日報明細の一覧",
            content: {
                "application/json": {
                    schema: UntenNippouMeisaiListResponseSchema,
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
        }
    },

})

export const untenlistHandler: RouteHandler<typeof untenlistRoute, ENV> = async (c) => {
    const prisma = checkPrismaClient(c);
    if (!prisma) return createPrismaNotFoundResponse(c);
    try {
        await prisma.$connect();
        const tables = await prisma.untenNippouMeisai.findMany({ "take": 10, where: { untenDate: { gte: new Date() } } });
        console.log('\n📊 データベースのテーブル一覧:');
        if (tables.length === 0) {
            console.log('データが見つかりませんでした。');
            return c.json({ error: 'データが見つかりませんでした。' }, 500);
        }
        return c.json(tables, 200);
    } catch (e) {
        console.error('❌ データベース接続または操作エラー:', e);
        if (e instanceof Error) {
            console.error('エラーメッセージ:', e.message);
            if ('code' in e) {
                console.error('エラーコード:', e.code);
            }
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    } finally {
        // Prisma クライアントの接続を切断
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

