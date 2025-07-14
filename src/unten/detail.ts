import { z } from "zod";
import { ENV } from "..";
import { sqlSvMiddleware } from "../middleware/sqlsv";
import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { UntenDetailParamsSchema, BaseUntenNippouMeisaiSchema, ErrorResponseSchema } from "../openApi/schema";


import { checkPrismaClient, createPrismaNotFoundResponse } from "../utils/prisma";
// パラメータスキーマの定義

// 単一の運転日報明細を取得するルート（スキーマをcomponentsに含めるため）
export const untenDetailRoute = createRoute({
    method: "get",
    path: "/{kanriDate}/{kanriC}",
    request: {
        params: UntenDetailParamsSchema
    },
    responses: {
        200: {
            description: "運転日報明細の詳細",
            content: {
                "application/json": {
                    schema: BaseUntenNippouMeisaiSchema,
                },
            },
        },
        404: {
            description: "Not Found",
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
        }
    },
});
export const untenDetailHandler: RouteHandler<typeof untenDetailRoute, ENV> = async (c) => {
    const { kanriDate, kanriC } = c.req.valid('param');
    const prisma = checkPrismaClient(c);
    if (!prisma) return createPrismaNotFoundResponse(c);

    try {
        await prisma.$connect();
        const item = await prisma.untenNippouMeisai.findFirst({
            where: {
                kanriC: parseInt(kanriC),
                kanriDate: new Date(kanriDate)
            }
        });

        if (!item) {
            return c.json({ error: '運転日報明細が見つかりませんでした。' }, 404);
        }

        return c.json(item, 200);
    } catch (e) {
        console.error('❌ データベース接続または操作エラー:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
};