// utils/sqliteErrorHandler.ts
import { LibsqlError } from "@libsql/client";
import { Context } from "hono";
import { ZodError } from "zod";

/**
 * SQLite/Drizzle/libsql系のエラーをHonoのレスポンスとして返す共通関数
 * @param error 捕捉したエラー
 * @param c HonoのContext
 * @param userData? 409時のID表示用
 */

/**
 * SQLite/Drizzle/libsql系のエラーをHonoのレスポンスとして返す共通関数
 * @param error 捕捉したエラー
 * @param c HonoのContext
 * ZodError対応: バリデーションエラー時は400で返す
 */
export function handleSqliteError(error: any, c: Context) {
    // Zodバリデーションエラー対応


    console.error('Error adding user:');

    // DrizzleQueryError の 'cause' プロパティをチェックする
    if (error && typeof error === 'object' && 'cause' in error) {
        const underlyingError = error.cause; // cause が真のエラーオブジェクト
        console.error('Underlying error found in cause:', underlyingError);

        if (underlyingError instanceof LibsqlError) {
            console.error('LibsqlError caught via cause property:', underlyingError);
            if (underlyingError.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                // 主キー制約違反の場合
                return c.json({ error: `Conflict: User with ID  already exists.` }, 409);
            }
            // その他のLibsqlError
            return c.json({ error: `Database Error: ${underlyingError.code}: ${underlyingError.message}` }, 500);
        } else if (underlyingError instanceof Error) {
            // underlyingError が LibsqlError ではないが Error インスタンスの場合
            console.error('General Error in cause property caught:', underlyingError);
            return c.json({ error: `Internal Server Error: ${underlyingError.message}` }, 500);
        }
    }

    // DrizzleQueryError でラップされていない、または cause がない一般的な Error
    if (error instanceof Error) {
        console.error('General Error caught (top-level):', error);
        return c.json({ error: `Internal Server Error: ${error.message}` }, 500);
    } else {
        // 予期しない型のエラー
        console.error('Unknown error type caught (top-level):', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
}
