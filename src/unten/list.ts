import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { ENV } from "..";
import { sqlSvMiddleware } from "../middleware/sqlsv";
import { checkPrismaClient, createPrismaNotFoundResponse, buildDateRangeConditions } from "../utils/prisma";
import {
    UntenNippouMeisaiListResponseSchema, ErrorResponseSchema,
    BaseUntenNippouMeisaiSchema, UntenNippouMeisaiSchemaSearchSchema
} from "../openApi/schema";
import type { Prisma } from "../../prisma/src/generated/prisma";

export const untenlistRoute = createRoute({
    method: "post",
    path: "/",
    middleware: [sqlSvMiddleware],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UntenNippouMeisaiSchemaSearchSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "運転日報明細の一覧",
            content: {
                "application/json": {
                    schema: UntenNippouMeisaiListResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid query parameters",
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

})

export const untenlistHandler: RouteHandler<typeof untenlistRoute, ENV> = async (c) => {
    const { fromTsumikomiDate, toTsumikomiDate, fromOroshiDate, toOroshiDate, jyuchuBumon, kadouBumon, fromUnkouDate, toUnkouDate, sharyoC, sharyoH } = c.req.valid("json");

    // JSONボディの検証
    if (!c.req.valid("json")) {
        console.log('Invalid JSON body');
        return c.json({ error: "Invalid JSON body" }, 400);
    }

    console.log('Valid JSON body:', c.req.valid("json"));
    const prisma = checkPrismaClient(c);
    if (!prisma) return createPrismaNotFoundResponse(c);
    try {
        await prisma.$connect();

        // 動的にwhere条件を構築
        const whereConditions: Prisma.UntenNippouMeisaiWhereInput = {};

        // 積み込み日の条件を構築
        const tsumikomiDateConditions = buildDateRangeConditions(fromTsumikomiDate, toTsumikomiDate);
        if (tsumikomiDateConditions) whereConditions.tsumikomiDate = tsumikomiDateConditions;


        // 運行日の条件を構築
        const unkouDateConditions = buildDateRangeConditions(fromUnkouDate, toUnkouDate);
        if (unkouDateConditions) whereConditions.unkouDate = unkouDateConditions;


        // 卸日の条件を構築
        const oroshiDateConditions = buildDateRangeConditions(fromOroshiDate, toOroshiDate);
        if (oroshiDateConditions) whereConditions.oroshiDate = oroshiDateConditions;


        if (jyuchuBumon != null && jyuchuBumon !== undefined && Array.isArray(jyuchuBumon) && jyuchuBumon.length > 0) {
            whereConditions.juchuBumon = { in: jyuchuBumon };
        }

        if (kadouBumon != null && kadouBumon !== undefined && Array.isArray(kadouBumon) && kadouBumon.length > 0) {
            whereConditions.kadouBumon = { in: kadouBumon };
        }

        if (sharyoC != null && sharyoC !== undefined) {
            whereConditions.sharyoC = { equals: sharyoC };
        }
        if (sharyoH != null && sharyoH !== undefined) {
            whereConditions.sharyoH = { equals: sharyoH };
        }



        const tables = await prisma.untenNippouMeisai.findMany({
            where: whereConditions
        });
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

