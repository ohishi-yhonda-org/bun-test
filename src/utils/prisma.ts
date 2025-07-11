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
