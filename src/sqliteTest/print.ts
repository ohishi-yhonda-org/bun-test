import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { NullResponseSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
import { exec } from 'child_process'; // exec をインポート

export const sqliteTestPrintRoute = createRoute({
    method: "post",
    path: "/print",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        document: z.instanceof(File).describe("The document to print"),
                        printer: z.string().optional().describe("The printer name (optional, defaults to 'LBP221(旅費)')"),
                    }).openapi({
                        title: "PrintRequest",
                        type: "object",
                        description: "Request body for printing a document",
                        required: ["document"],
                        // example: {
                        //     // document: "file.pdf",
                        //     printer: "LBP221(旅費)",
                        // },
                    }),
                },
            },
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
        404: {
            description: "Printer not found",
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
    },
});
const ADOBE_ACROBAT_PATH = process.env.ADOBE_ACROBAT_PATH;

export const sqliteTestPrintHandler: RouteHandler<typeof sqliteTestPrintRoute, ENV> = async (c) => {
    try {
        // Print job submission logic goes here
        // file 作成
        const filepath = `ryohi.pdf`;
        const fs = require('fs');

        console.log('Submitting print job');
        const fileContent = await c.req.parseBody();

        if (!fileContent || !fileContent.document) {
            return c.json({ error: "No document provided" }, 500);
        }
        if (!(fileContent.document instanceof File)) {
            return c.json({ error: "Invalid document type" }, 500);
        }

        // Assuming fileContent.document is a File object
        const documentFile = fileContent.document;
        const arrayBuffer = await documentFile.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const printerName = fileContent.printer || "LBP221(旅費)";

        fs.writeFileSync(filepath, fileBuffer);
        const currentPath = process.cwd();

        console.log('Current Directory:', currentPath);
        const adobePath = ADOBE_ACROBAT_PATH?.toString() || "C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe";
        const commandPrint = `"${adobePath}" /t "${currentPath}\\${filepath}" "${printerName}"`;
        console.log('Print Command:', commandPrint);

        // c.executionCtx?.waitUntil(
        //     new Promise((resolve, reject) => {
        //         try {
        //             const execSync = require('child_process');
        //             execSync(commandPrint);
        //             console.log('File sent to printer successfully.');
        //         } catch (printError: any) {
        //             console.error('Error sending file to printer:', printError.message);
        //             return c.json({ error: `Failed to print: ${printError.message}` }, 500);
        //         }
        //     }))
        exec(commandPrint, (error, stdout, stderr) => {
            if (error) {
                console.error('Error sending file to printer:', error.message);
                // エラー応答は Hono の Context を使って返す
                // 非同期なので、ここで直接return c.json()とはできないため、
                // 適切なエラーハンドリングまたは通知メカニズムを考慮する必要がある
                // 例: ログに記録し、クライアントにはすぐにOKを返しておくか、
                // 後でWebsocket等で結果を通知する
                return; // ここで早期リターン
            }
            if (stderr) {
                console.warn('Printer command stderr:', stderr);
            }
            console.log('File sent to printer successfully.');
            console.log('Printer command stdout:', stdout);
            // 成功時の処理（クライアントへの通知など）
        });
        // console.log

        console.log(`Print job submitted for file: ${filepath}`);
        return c.json({}, 200);
    } catch (error) {
        console.error("Error submitting print job:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
};
