import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { sqliteTestListUsersAddSchema, ErrorResponseSchema, NullResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../db/schema";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
import { printDocument } from "../print";
import { File } from "buffer";
export const sqliteTestPrintRoute = createRoute({
    method: "post",
    path: "/print",
    // security: [{ sakuraBasicAuth: [] }],
    request: {
        body: {
            content: {
                "form-data": {
                    schema: z.object({
                        document: z.instanceof(Buffer).describe("The document to print in binary format")
                    }).openapi("pdffile", {
                        description: "The document to print in binary format",
                    }),
                }
            }
            // schema: sqliteTestListUsersAddSchema,
        },
    },
    responses: {
        200: {
            description: "Print job submitted successfully",
            content: {
                "application/json": {
                    schema: NullResponseSchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Internal Server Error",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    }
})


export const sqliteTestPrintHandler: RouteHandler<typeof sqliteTestPrintRoute, ENV> = async (c) => {
    const formData = await c.req.parseBody();
    const document = formData.document as File;
    if (!document) {
        return c.json({ error: "Document is required" }, 400);
    }
    const fileBuffer = await document.arrayBuffer();
    const originalname = document.name;
    const mimetype = document.type;

    console.log(`Received file: ${originalname}, MIME type: ${mimetype} ,file size: ${fileBuffer.byteLength} bytes`);
    try {
        // ここでプリント処理を呼び出す
        const printResult = await printDocument(Buffer.from(fileBuffer), originalname, mimetype);

        // Simulate a successful print job submission
        return c.json({ message: "Print job submitted successfully" }, 200);
    } catch (error) {
        // Always return 500 for unexpected errors to match OpenAPI spec
        return c.json({ error: "Internal Server Error" }, 500);
    }
}