import { Context } from "hono";
import { PrismaClient } from "../../prisma/src/generated/prisma";

/**
 * Prisma Clientが正しく設定されているかチェックする関数
 * @param c Honoのコンテキスト
 * @returns Prisma Clientインスタンス、またはnull
 */
export function validatePrismaClient(c: Context): PrismaClient | null {
    const prisma = c.get("PrismaClient");
    if (!prisma) {
        console.error('❌ Prisma Client が見つかりません。ミドルウェアが正しく設定されているか確認してください。');
        return null;
    }
    return prisma;
}

/**
 * Prisma Clientのチェックを行い、エラーがある場合はエラーレスポンスを返す関数
 * @param c Honoのコンテキスト
 * @returns Prisma Clientインスタンス、またはnull（エラーレスポンスは呼び出し元で処理）
 */
export function checkPrismaClient(c: Context): PrismaClient | null {
    return validatePrismaClient(c);
}

/**
 * Prisma Clientのチェックを行い、エラーレスポンスを返すヘルパー関数
 * @param c Honoのコンテキスト
 * @returns エラーレスポンス
 */
export function createPrismaNotFoundResponse(c: Context) {
    return c.json({ error: 'Prisma Client not found' }, 500);
}

/**
 * 日付範囲の条件を構築する汎用関数
 * @param fromDate 開始日（文字列形式）
 * @param toDate 終了日（文字列形式）
 * @returns 日付範囲条件オブジェクト、条件がない場合はundefined
 */
export function buildDateRangeConditions(
    fromDate?: string | null,
    toDate?: string | null
): { gte?: Date; lte?: Date } | undefined {
    const conditions: { gte?: Date; lte?: Date } = {};

    if (fromDate != null && fromDate !== undefined) {
        conditions.gte = new Date(fromDate);
    }

    if (toDate != null && toDate !== undefined) {
        conditions.lte = new Date(toDate);
    }

    // 条件が設定されている場合のみ返す
    return Object.keys(conditions).length > 0 ? conditions : undefined;
}

/**
 * 積み込み日の条件を構築する関数（後方互換性のため残す）
 * @param fromDate 開始日（文字列形式）
 * @param toDate 終了日（文字列形式）
 * @returns 日付範囲条件オブジェクト、条件がない場合はundefined
 * @deprecated buildDateRangeConditions を使用してください
 */
export function buildTsumikomiDateConditions(
    fromDate?: string | null,
    toDate?: string | null
): { gte?: Date; lte?: Date } | undefined {
    return buildDateRangeConditions(fromDate, toDate);
}
