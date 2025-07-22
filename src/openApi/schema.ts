import { z } from "@hono/zod-openapi"
import { password, sha } from "bun";
import id from "zod/v4/locales/id.cjs";
import bcrypt from 'bcryptjs'; // bcryptをインポート


// 今日の日付をISO形式で取得する関数（UTC時間で00:00:00）
const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

export const BaseUntenNippouMeisaiSchema = z.object({
    unkouDate: z.string().openapi({
        example: getTodayISO()
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
        example: getTodayISO()
    }),
    kanriC: z.number().openapi({
        example: 1
    }),
    tsumikomiDate: z.string().openapi({
        example: getTodayISO()
    }),
    oroshiDate: z.string(),
    firstInputTime: z.string(),
    updateTime: z.string(),
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
    seikyuK: z.number()
}).openapi('BaseUntenNippouMeisaiSchema', {
    type: 'object',
    description: '運転日報明細の基本スキーマ',
    properties: {
        unkouDate: { example: getTodayISO(), type: 'string' },
        sharyoC: { example: 'V001', type: 'string' },
        sharyoH: { example: 'トラック01', type: 'string' },
        untenshuC: { example: 'D001', type: 'string' },
        yoshaC: { example: 'Y001', type: 'string' },
        yoshaH: { example: '傭車会社A', type: 'string' },
        nyuryokuC: { example: 'U001', type: 'string' },
        kanriDate: { example: getTodayISO(), type: 'string' },
        kanriC: { example: 1, type: 'number' },
        tsumikomiDate: { example: getTodayISO(), type: 'string' },
        oroshiDate: { example: getTodayISO(), type: 'string' },
        updateTime: { example: getTodayISO(), type: 'string' },
        firstInputTime: { example: getTodayISO(), type: 'string' },
        juchuBumon: { example: '営業1課', type: 'string' },
        kadouBumon: { example: '運行1課', type: 'string' },
        tokuiC: { example: 'C001', type: 'string' },
        tokuiH: { example: '得意先会社A', type: 'string' },
        hatsuchiN: { example: '東京都', type: 'string' },
        chakuchiN: { example: '大阪府', type: 'string' },
        seikyuK: { example: 1, type: "number" }
    }
});

export const UntenNippouMeisaiSchemaSearchSchema = z.object({
    fromTsumikomiDate: z.string().optional().nullable(),
    toTsumikomiDate: z.string().optional().nullable(),
    fromOroshiDate: z.string().optional().nullable(),
    toOroshiDate: z.string().optional().nullable(),
    jyuchuBumon: z.array(z.string()).optional().nullable(),
    kadouBumon: z.array(z.string()).optional().nullable(),
    fromUnkouDate: z.string().optional().nullable(),
    toUnkouDate: z.string().optional().nullable(),
    sharyoC: z.string().optional().nullable(),
    sharyoH: z.string().optional().nullable(),
}).openapi('UntenNippouMeisaiSchemaSearchSchema', {
    type: 'object',
    description: '運転日報明細の検索スキーマ',
    param: {
        description: 'パラメータスキーマ',
        name: 'UntenNippouMeisaiSchemaSearchSchema',
    },
    properties: {
        sharyoC: {
            type: 'string',
            description: '車両コード',
            example: '3792',
        },
        sharyoH: {
            type: 'string',
            description: '車両コードH',
            example: '00',
        },
        fromUnkouDate: {
            type: 'string',
            description: '運行日からの検索',
            example: getTodayISO(),
            nullable: true
        },
        toUnkouDate: {
            type: 'string',
            description: '運行日までの検索',
            example: getTodayISO(),
            nullable: true
        },
        fromTsumikomiDate: {
            type: 'string',
            description: '積込み日からの検索',
            example: getTodayISO(),
            nullable: true
        },
        toTsumikomiDate: {
            type: 'string',
            description: '積込み日までの検索',
            example: getTodayISO(),
            nullable: true
        },
        fromOroshiDate: {
            type: 'string',
            description: '運送日からの検索',
            example: getTodayISO(),
            nullable: true
        },
        toOroshiDate: {
            type: 'string',
            description: '運送日までの検索',
            example: getTodayISO(),
            nullable: true
        },
        jyuchuBumon: {
            type: 'array',
            description: '受注部署のフィルタリング',
            items: {
                type: 'string',
                example: '010'
            }
            , nullable: true
        }
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

export const sqliteTestListUsers = z.object({
    id: z.number().openapi({
        example: 1
    }),
    name: z.string().openapi({
        example: "John Doe"
    }),
    email: z.string().openapi({
        example: "john.doe@example.com"
    }),
    age: z.number().nullable().optional().openapi({
        example: 30
    }),

}).openapi("sqliteTestListUsers", {
    type: "object",
    description: "SQLite Test List Users",
    properties: {
        id: {
            type: "number",
            example: 1
        },
        name: {
            type: "string",
            example: "John Doe"
        },
        email: {
            type: "string",
            example: "john.doe@example.com"
        },
        age: {
            type: "number",
            example: 30,
            nullable: true
        },

    }
});

export const sqliteTestListUsersWOPasswordSchema = z.object({
    id: z.number().openapi({
        example: 1
    }),
    name: z.string().openapi({
        example: "John Doe"
    }),
    email: z.string().openapi({
        example: "john.doe@example.com"
    }),
    age: z.number().nullable().optional().openapi({
        example: 30
    }),
}).openapi("sqliteTestListUsersWOPasswordSchema", {
    type: "object",
    description: "SQLite Test List Users Without Password",
    properties: {
        id: {
            type: "number",
            example: 1
        },
        name: {
            type: "string",
            example: "John Doe"
        },
        email: {
            type: "string",
            example: "john.doe@example.com"
        },
        age: {
            type: "number",
            example: 30,
            nullable: true
        },

    }

})

export const sqliteTestListUsersWOPasswordArraySchema = z.array(sqliteTestListUsersWOPasswordSchema).openapi("sqliteTestListUsersWOPasswordArraySchema", {
    type: "array",
    description: "SQLite Test List Users Without Password Array Schema",
    items: {
        $ref: "#/components/schemas/sqliteTestListUsersWOPasswordSchema"
    }
});

export const verifyUserSchema = z.object({
    email: z.string(),
    password: z.string()
}).openapi("verifyUserSchema", {
    type: "object",
    description: "Verify User Schema",
    properties: {
        email: {
            type: "string",
            example: "john.doe@example.com"
        },
        password: {
            type: "string",
            example: "password123"
        }
    }
});

export const sqliteTestListUsersAddSchema = z.object({
    name: sqliteTestListUsers.shape.name,
    email: sqliteTestListUsers.shape.email,
    age: sqliteTestListUsers.shape.age,
    password: z.string()

}).openapi("sqliteTestListUsersAddSchema", {
    type: "object",
    description: "SQLite Test List Users Add Schema",
    properties: {
        name: {
            type: "string",
            example: "John Doe"
        },
        email: {
            type: "string",
            example: "john.doe@example.com"
        },
        age: {
            type: "number",
            example: 30,
            nullable: true
        },
        password: {
            type: "string",
            example: "password123"
        }
    }
});

export const sqliteTestListUsersArray = z.array(sqliteTestListUsers).openapi("sqliteTestListUsersArray", {
    type: "array",
    description: "SQLite Test List Users Array",
    items: {
        $ref: "#/components/schemas/sqliteTestListUsers"
    }
});

export const sqliteTestListResponseSchema = z.array(sqliteTestListUsers).openapi("sqliteTestListResponseSchema", {
    type: "array",
    description: "SQLite Test List Response",
    items: {
        $ref: "#/components/schemas/sqliteTestListUsers"
    }
});

export const sqliteTestListParamsSchema = z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    age: z.string().optional().nullable(),
}).openapi("sqliteTestListParamsSchema", {
    type: "object",
    description: "SQLite Test List Params",
    properties: {
        id: {
            type: "string",
            example: "1",
            nullable: true
        },
        name: {
            type: "string",
            example: "John Doe",
            nullable: true
        },
        email: {
            type: "string",
            example: "john.doe@example.com",
            nullable: true
        },
        age: {
            type: "string",
            example: "30",
            nullable: true
        }
    }
});

export const NullResponseSchema = z.object({
    message: z.string().optional().nullable().openapi({ example: 'No content' })
}).openapi("NullResponseSchema", {
    type: "object",
    description: "No content",
    properties: {
        message: {
            type: "string",
            nullable: true,
            example: "No content"
        }
    }
});

