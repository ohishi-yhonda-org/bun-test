import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { z } from "zod";
import { ENV } from "..";
import { sqlSvMiddleware } from "../middleware/sqlsv";
import fi from "zod/v4/locales/fi.cjs";
import { sql } from "bun";
import { checkPrismaClient, createPrismaNotFoundResponse } from "../utils/prisma";
import ta from "zod/v4/locales/ta.cjs";
import { UntenNippouMeisaiSchema } from "../../prisma/generated/zod/modelSchema/UntenNippouMeisaiSchema";
import { UntenNippouMeisaiKanriDateKanriCCompoundUniqueInputSchema } from "../../prisma/generated/zod/inputTypeSchemas/UntenNippouMeisaiKanriDateKanriCCompoundUniqueInputSchema";
// 基本のZodスキーマ（UntenNippouMeisaiSchemaをベースにOpenAPI定義を追加）
export const BaseUntenNippouMeisaiSchema = UntenNippouMeisaiSchema.extend({
    untenDate: UntenNippouMeisaiSchema.shape.untenDate.openapi({
        type: 'string',
        format: 'date-time',
        description: '運転日',
        example: '2025-07-11T00:00:00.000Z'
    }),
    sharyoC: UntenNippouMeisaiSchema.shape.sharyoC.openapi({
        type: 'string',
        description: '車輌C',
        example: 'V001'
    }),
    sharyoH: UntenNippouMeisaiSchema.shape.sharyoH.openapi({
        type: 'string',
        description: '車輌H',
        example: 'トラック01'
    }),
    untenshuC: UntenNippouMeisaiSchema.shape.untenshuC.openapi({
        type: 'string',
        description: '運転手C',
        example: 'D001'
    }),
    yoshaC: UntenNippouMeisaiSchema.shape.yoshaC.openapi({
        type: 'string',
        description: '傭車先C',
        example: 'Y001'
    }),
    yoshaH: UntenNippouMeisaiSchema.shape.yoshaH.openapi({
        type: 'string',
        description: '傭車先H',
        example: '傭車会社A'
    }),
    nyuryokuC: UntenNippouMeisaiSchema.shape.nyuryokuC.openapi({
        type: 'string',
        description: '入力担当C',
        example: 'U001'
    }),
    kanriDate: UntenNippouMeisaiSchema.shape.kanriDate.openapi({
        type: 'string',
        format: 'date-time',
        description: '管理年月日',
        example: '2025-07-11T00:00:00.000Z'
    }),
    kanriC: UntenNippouMeisaiSchema.shape.kanriC.openapi({
        type: 'integer',
        description: '管理C',
        example: 1
    }),
    tsukikomiDate: UntenNippouMeisaiSchema.shape.tsukikomiDate.openapi({
        type: 'string',
        format: 'date-time',
        description: '積込年月日',
        example: '2025-07-11T00:00:00.000Z'
    }),
    nyuuryokuDate: UntenNippouMeisaiSchema.shape.nyuuryokuDate.openapi({
        type: 'string',
        format: 'date-time',
        description: '納入年月日',
        example: '2025-07-11T00:00:00.000Z'
    }),
    juchuBumon: UntenNippouMeisaiSchema.shape.juchuBumon.openapi({
        type: 'string',
        description: '受注部門',
        example: '営業1課'
    }),
    kadouBumon: UntenNippouMeisaiSchema.shape.kadouBumon.openapi({
        type: 'string',
        description: '稼動部門',
        example: '運行1課'
    }),
    tokuiC: UntenNippouMeisaiSchema.shape.tokuiC.openapi({
        type: 'string',
        description: '得意先C',
        example: 'C001'
    }),
    tokuiH: UntenNippouMeisaiSchema.shape.tokuiH.openapi({
        type: 'string',
        description: '得意先H',
        example: '得意先会社A'
    }),
    hatsuchiN: UntenNippouMeisaiSchema.shape.hatsuchiN.openapi({
        type: 'string',
        description: '発地N',
        example: '東京都'
    }),
    chakuchiN: UntenNippouMeisaiSchema.shape.chakuchiN.openapi({
        type: 'string',
        description: '着地N',
        example: '大阪府'
    }),
}).openapi('UntenNippouMeisai', {
    type: 'object',
    description: '運転日報明細'
});


// レスポンススキーマの定義
const UntenNippouMeisaiListResponseSchema = z.object({
    tables: z.array(BaseUntenNippouMeisaiSchema).openapi({
        type: 'array',
        description: 'テーブル一覧'
    })
}).openapi('UntenNippouMeisaiListResponse', {
    type: 'object',
    description: '運転日報明細一覧レスポンス'
});

const ErrorResponseSchema = z.object({
    error: z.string().openapi({
        type: 'string',
        description: 'エラーメッセージ',
        example: 'Internal Server Error'
    })
}).openapi('ErrorResponse', {
    type: 'object',
    description: 'エラーレスポンス'
});

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
        return c.json({ "tables": tables }, 200);
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

// パラメータスキーマの定義
const UntenDetailParamsSchema = z.object({
    kanriDate: z.string().openapi({
        param: {
            name: 'kanriDate',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                format: 'date-time'
            },
            description: '管理年月日',
            example: '2025-07-11T00:00:00.000Z'
        }
    }),
    kanriC: z.string().openapi({
        param: {
            name: 'kanriC',
            in: 'path',
            required: true,
            schema: {
                type: 'string'
            },
            description: '管理C',
            example: '1'
        }
    })
}).openapi('UntenDetailParams', {
    type: 'object',
    description: 'パラメータスキーマ'
});

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