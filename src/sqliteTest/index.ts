import { OpenAPIHono } from "@hono/zod-openapi";

import { ENV } from "..";
import { sqliteTestListHandler, sqliteTestListRoute } from "./list";
import { createClient } from "@libsql/client";

import { drizzle } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";
import { basicAuth } from "hono/basic-auth";
import { users } from "../db/schema";

import { sqliteTestListUsers, verifyUserSchema, sqliteTestListUsersWOPasswordSchema } from "../openApi/schema";
import { sqliteTestAddRoute, sqliteTestAddHandler } from "./add";
import { sqliteTestListDeleteRoute, sqliteTestListDeleteHandler } from "./delete";
import { sqliteTestGetPrinterRoute, sqliteTestGetPrinterHandler } from "./getPrinters";
import { sqliteTestGetCurrentFolderRoute, sqliteTestGetCurrentFolderHandler } from "./getCurrentFolder";
import { sqliteTestPrintRoute, sqliteTestPrintHandler } from "./print";
// import { sqliteTestGetPrinterAttributesRoute, sqliteTestGetPrinterAttributesHandler } from "./printerAttribute";
export const sqliteTestApi = new OpenAPIHono<ENV>()
    .openapi(sqliteTestListRoute, sqliteTestListHandler)
    .openapi(sqliteTestAddRoute, sqliteTestAddHandler)
    .openapi(sqliteTestListDeleteRoute, sqliteTestListDeleteHandler)
    .openapi(sqliteTestGetPrinterRoute, sqliteTestGetPrinterHandler)
    .openapi(sqliteTestPrintRoute, sqliteTestPrintHandler)
    .openapi(sqliteTestGetCurrentFolderRoute, sqliteTestGetCurrentFolderHandler);

// .openapi(sqliteTestGetPrinterAttributesRoute, sqliteTestGetPrinterAttributesHandler) //lbp221では機能しなかった


const registry = sqliteTestApi.openAPIRegistry
registry.register("sqliteTestListUsers", sqliteTestListUsers);

registry.register("sqliteTestListUsersWOPasswordSchema", sqliteTestListUsersWOPasswordSchema);
