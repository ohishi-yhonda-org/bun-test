import { OpenAPIHono } from "@hono/zod-openapi";

import { ENV } from "..";
import { sqliteTestListHandler, sqliteTestListRoute } from "./list";

import { sqliteTestListUsers } from "../openApi/schema";
import { sqliteTestAddRoute, sqliteTestAddHandler } from "./add";
export const sqliteTestApi = new OpenAPIHono<ENV>()
    .openapi(sqliteTestListRoute, sqliteTestListHandler)
    .openapi(sqliteTestAddRoute, sqliteTestAddHandler)



const registry = sqliteTestApi.openAPIRegistry
registry.register("sqliteTestListUsers", sqliteTestListUsers);
