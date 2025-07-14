import { z } from "@hono/zod-openapi"
export const BaseUntenNippouMeisaiSchema = z.object({
    untenDate: z.string().openapi({
        example: '2025-07-11T00:00:00.000Z'
    }),
    sharyoC: z.string().openapi({
        example: 'V001'
    }),
    sharyoH: z.string().openapi({
        example: 'トラック01'
    }),
    untenshuC: z.string().openapi({
        example: 'D001'
    }),
    yoshaC: z.string().openapi({
        example: 'Y001'
    }),
    yoshaH: z.string().openapi({
        example: '傭車会社A'
    }),
    nyuryokuC: z.string().openapi({
        example: 'U001'
    }),
    kanriDate: z.string().openapi({
        example: '2025-07-11T00:00:00.000Z'
    }),
    kanriC: z.number().openapi({
        example: 1
    }),
    tsukikomiDate: z.string().openapi({
        example: '2025-07-11T00:00:00.000Z'
    }),
    nyuuryokuDate: z.string().openapi({
        example: '2025-07-11T00:00:00.000Z'
    }),
    juchuBumon: z.string().openapi({
        example: '営業1課'
    }),
    kadouBumon: z.string().openapi({
        example: '運行1課'
    }),
    tokuiC: z.string().openapi({
        example: 'C001'
    }),
    tokuiH: z.string().openapi({
        example: '得意先会社A'
    }),
    hatsuchiN: z.string().openapi({
        example: '東京都'
    }),
    chakuchiN: z.string().openapi({
        example: '大阪府'
    }),
}).openapi('BaseUntenNippouMeisaiSchema', {
    type: 'object',
    description: '運転日報明細の基本スキーマ',
    properties: {
        untenDate: { example: '2025-07-11T00:00:00.000Z', type: 'string' },
        sharyoC: { example: 'V001', type: 'string' },
        sharyoH: { example: 'トラック01', type: 'string' },
        untenshuC: { example: 'D001', type: 'string' },
        yoshaC: { example: 'Y001', type: 'string' },
        yoshaH: { example: '傭車会社A', type: 'string' },
        nyuryokuC: { example: 'U001', type: 'string' },
        kanriDate: { example: '2025-07-11T00:00:00.000Z', type: 'string' },
        kanriC: { example: 1, type: 'number' },
        tsukikomiDate: { example: '2025-07-11T00:00:00.000Z', type: 'string' },
        nyuuryokuDate: { example: '2025-07-11T00:00:00.000Z', type: 'string' },
        juchuBumon: { example: '営業1課', type: 'string' },
        kadouBumon: { example: '運行1課', type: 'string' },
        tokuiC: { example: 'C001', type: 'string' },
        tokuiH: { example: '得意先会社A', type: 'string' },
        hatsuchiN: { example: '東京都', type: 'string' },
        chakuchiN: { example: '大阪府', type: 'string' }
    }
});

export const UntenNippouMeisaiListResponseSchema = z.array(BaseUntenNippouMeisaiSchema).openapi("UntenNippouMeisaiListResponseSchema", {
    type: 'array',
    description: '運転日報明細の一覧',
    items: {
        $ref: '#/components/schemas/BaseUntenNippouMeisaiSchema'
    }
})

export const ErrorResponseSchema = z.object({
    error: z.string().openapi({ example: 'Internal Server Error' })
    // }).openapi("ErrorResponseSchema", { type: 'object', description: 'エラーレスポンスのスキーマ' });
}).openapi("ErrorResponseSchema", {
    type: 'object',
    description: 'エラーレスポンスのスキーマ',
    properties: {
        error: {
            type: 'string',
            example: 'Internal Server Error'

        }
    }
});


export const UntenDetailParamsSchema = z.object({
    kanriDate: z.string(),
    kanriC: z.string()
}).openapi('UntenDetailParams', {
    type: 'object',
    description: 'パラメータスキーマ'
});
