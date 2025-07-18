import { OpenAPIHono } from "@hono/zod-openapi";
import { ENV } from ".."
import { untenlistRoute, untenlistHandler } from "./list";
import { untenDetailRoute, untenDetailHandler } from "./detail";
import { BaseUntenNippouMeisaiSchema } from "../openApi/schema";
export const untenApi = new OpenAPIHono<ENV>();
const st = untenApi.openapi(untenlistRoute, untenlistHandler);


const registry = untenApi.openAPIRegistry
registry.register("BaseUntenNippouMeisaiSchema", BaseUntenNippouMeisaiSchema);
