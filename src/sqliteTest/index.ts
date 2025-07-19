import { OpenAPIHono } from "@hono/zod-openapi";

import { ENV } from "..";
import { sqliteTestListHandler, sqliteTestListRoute } from "./list";
import { createClient } from "@libsql/client";

import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { basicAuth } from "hono/basic-auth";
import { users } from "../db/schema";

import { sqliteTestListUsers } from "../openApi/schema";
import { sqliteTestAddRoute, sqliteTestAddHandler } from "./add";
export const sqliteTestApi = new OpenAPIHono<ENV>()
    .openapi(sqliteTestListRoute, sqliteTestListHandler)
    .openapi(sqliteTestAddRoute, sqliteTestAddHandler)

sqliteTestApi.openAPIRegistry.registerComponent("securitySchemes", "sakuraBasicAuth", {

    type: "http",
    scheme: "basic",
    description: "Basic authentication for SQLite Test API"

});

sqliteTestApi.delete("*", basicAuth({
    verifyUser: async (username, password, c) => {
        const client = createClient({
            url: process.env.NODE_ENV === "dev" ? "file:sqlite.db" : "file:..\\sqlite.db"
        });
        const db = drizzle(client);

        const result = await db.select().from(users).where(eq(users.name, username)).all().then((result) => {
            if (result.length === 0) {
                return false;
            }
            const user = result[0];
            if (user.name === username && user.email === password) {
                return true;
            }
            return false;
        });
        // If no user found, check if the database is empty
        // If empty, allow access with default credentials
        if (!result) {
            const count = await db.$count(users);
            if (count === 0) {
                return username === "admin" && password === "password";
            } else {
                return false;
            }
        } else {

            // Return true if the user is found and credentials match
            return result;
        }
    }
}))

const registry = sqliteTestApi.openAPIRegistry
registry.register("sqliteTestListUsers", sqliteTestListUsers);
