import { Hono } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'

import { PrismaClient } from "../prisma/src/generated/prisma"; // TypeScriptの場合
import { env, getRuntimeKey } from 'hono/adapter'
import { swaggerUI } from '@hono/swagger-ui'
import { createMiddleware } from 'hono/factory'

// index.ts
import { PrismaMssql } from '@prisma/adapter-mssql';
import * as mssql from 'mssql';
import untenApi from './unten';
import { BaseUntenNippouMeisaiSchema } from './unten/list';

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
if (false) BaseUntenNippouMeisaiSchema;



app.route('/unten', untenApi);

app.doc('/specification', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})
app.get('/doc', swaggerUI({ url: '/specification' }))


export default app
