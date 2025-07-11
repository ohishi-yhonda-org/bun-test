import { createMiddleware } from "hono/factory"; // HonoのcreateMiddleware関数をインポート
import { PrismaClient } from "../../prisma/src/generated/prisma"; // TypeScriptの場合

import { PrismaMssql } from "@prisma/adapter-mssql"; // PrismaMssqlアダプターをインポート
import { env } from "hono/adapter"; // Honoのenv関数をインポート
// mssqlパッケージをインポート
import * as mssql from 'mssql';

import { ENV } from ".."; // ENVタイプが定義されている場所からインポート

export const sqlSvMiddleware = createMiddleware<ENV>(async (c, next) => {
    console.log('🔌 SQL Server Middleware: 接続を開始します...');
    const { DB_HOST, DB_PORT, DATABASE, DB_USERNAME, DB_PASSWORD } = env<ENV["Bindings"]>(c);
    const config: mssql.config = {
        server: DB_HOST,
        port: Number(DB_PORT),
        database: DATABASE,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        options: {
            encrypt: false,
            trustServerCertificate: true,
        },
    };
    const adapter = new PrismaMssql(config);
    const prisma = new PrismaClient({ adapter }); // const を追加

    c.set('PrismaClient', prisma);
    await next();
    // リクエストごとの接続はパフォーマンスに影響を与える可能性があります。
    // 通常はアプリケーションのライフサイクルで一度だけ接続・切断を管理します。
});