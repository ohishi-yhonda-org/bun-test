import { Hono } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'

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
console.log(`Starting server on port ${port}`)

// PM2環境での起動を検出
const isPM2 = process.env.PM2_HOME !== undefined

// Bunサーバーを起動
try {
  const server = Bun.serve({
    port: Number(port),
    fetch: app.fetch,
  })

  console.log(`Server is running on http://localhost:${server.port}`)
  
  // PM2環境では、プロセスが正常に起動したことを明示的に通知
  if (isPM2) {
    console.log('PM2 environment detected, server started successfully')
  }
} catch (error) {
  console.error('Failed to start Bun server:', error)
  process.exit(1)
}

export default {
  port: port,
  fetch: app.fetch,
}
