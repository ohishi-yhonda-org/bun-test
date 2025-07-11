import { OpenAPIHono } from "@hono/zod-openapi";
import { ENV } from ".."
import { untenlistRoute, untenlistHandler, untenDetailRoute, untenDetailHandler, BaseUntenNippouMeisaiSchema } from "./list";
const untenApi = new OpenAPIHono<ENV>();

// スキーマを明示的に登録
untenApi.openapi(untenlistRoute, untenlistHandler);
untenApi.openapi(untenDetailRoute, untenDetailHandler);

export default untenApi;