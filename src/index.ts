import { Hono } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { serve } from '@hono/node-server'

import { PrismaClient } from "../prisma/src/generated/prisma"; // TypeScriptの場合
import { env, getRuntimeKey } from 'hono/adapter'
import { swaggerUI } from '@hono/swagger-ui'
import { createMiddleware } from 'hono/factory'

// index.ts
import { PrismaMssql } from '@prisma/adapter-mssql';
import * as mssql from 'mssql';
import { untenApi } from './unten';

export type ENV = {
  Bindings: {

    DB_HOST: string;
    DB_PORT: number;
    DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    Variables?: Record<string, string>;
  },
  Variables: {
    PrismaClient: PrismaClient;
  }
}
const app = new OpenAPIHono<ENV>()

// スキーマを明示的に参照してOpenAPIのcomponentsに含める
// この行は実行されないが、TypeScriptの型チェック時にスキーマが認識される



app.route('/unten', untenApi)
  .doc31('/specification', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'My API',
    },
  }).get('/doc', swaggerUI({ url: '/specification' }))

// ヘルスチェック用のルート
app.get('/', (c) => {
  return c.json({
    message: 'Bun Test API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// サーバーを起動
const port = process.env.PORT || 3000

// PM2環境での起動を検出
const isPM2 = process.env.PM2_HOME !== undefined

// ログをファイルに書き込む関数
function logToFile(message: string) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`

  // 標準出力とエラー出力の両方に書き込み
  process.stdout.write(logMessage)
  process.stderr.write(logMessage)
}

logToFile(`Starting server on port ${port}`)

// @hono/node-serverを使用してサーバーを起動
try {
  logToFile('Using @hono/node-server for reliable PM2 compatibility')

  serve({
    fetch: app.fetch,
    port: Number(port),
  })

  logToFile(`Server is running on http://localhost:${port}`)

  // PM2環境では、プロセスが正常に起動したことを明示的に通知
  if (isPM2) {
    logToFile('PM2 environment detected, server started successfully with @hono/node-server')
  }

  // サーバーが正常に起動したことを確認するためのヘルスチェック
  setInterval(() => {
    logToFile(`Server health check: running on port ${port}`)
  }, 30000) // 30秒ごと

} catch (error) {
  logToFile(`Failed to start server: ${error}`)
  process.exit(1)
}

// export default {
//   port: port,
//   fetch: app.fetch,
// }
