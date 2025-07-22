import { Hono } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { serve } from '@hono/node-server'

import { PrismaClient } from "../prisma/src/generated/prisma"; // TypeScriptの場合
import { swaggerUI } from '@hono/swagger-ui'
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { basicAuth } from 'hono/basic-auth';
import { verifyUserSchema } from './openApi/schema';
import { eq } from 'drizzle-orm';
import { users } from './db/schema';
// index.ts
import { untenApi } from './unten';
import { sqliteTestApi } from './sqliteTest';

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

console.log('ENV:', process.env.NODE_ENV);

const app = new OpenAPIHono<ENV>()

// スキーマを明示的に参照してOpenAPIのcomponentsに含める
// この行は実行されないが、TypeScriptの型チェック時にスキーマが認識される

app.openAPIRegistry.registerComponent("securitySchemes", "sakuraBasicAuth", {

  type: "http",
  scheme: "basic",
  description: "Basic authentication for SQLite Test API",
  in: "header",
  name: "Authorization",
})


const auth = basicAuth({
  verifyUser: async (username, password, c) => {
    const client = createClient({
      url: process.env.NODE_ENV === "dev" ? "file:sqlite.db" : "file:..\\sqlite.db"
    });
    const db = drizzle(client);
    console.log('SQLite Test Basic Auth Handler');
    const userVerify = await verifyUserSchema.parse({ email: username, password });
    // emailでユーザーを検索
    const user = await db.select().from(users).where(eq(users.email, userVerify.email)).then(r => r[0]);
    if (!user) {
      // DBが空ならデフォルト認証許可
      const count = await db.$count(users);
      if (count === 0) {
        return username === "admin" && password === "password";
      } else {
        return false;
      }
    }
    // bcryptでパスワード照合
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(userVerify.password, user.password);
    return isValid;
  }
});
// app.use("/doc/*", auth)
// app.post("*", auth)
app.delete("*", auth)


app.route('/unten', untenApi)
  .route('/sqliteTest', sqliteTestApi)
  .doc31('/specification', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'My API',
    },
  })
  // .use('/doc/*', async (c, next) => {
  //   const auth = basicAuth({
  //     username: 'user', // 本来は環境変数等でちゃんと値を設定
  //     password: 'pass', // 今回は固定
  //   });
  //   return auth(c, next);
  // })
  .get('/doc', swaggerUI({ url: '/specification' }))

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
