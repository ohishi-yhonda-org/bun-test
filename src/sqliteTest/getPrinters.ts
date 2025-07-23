import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { NullResponseSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
//fs をインポート
import * as fs from 'fs';
import * as os from 'os';

const filepath = `ryohi.pdf`;
import * as iconv from 'iconv-lite'; // iconv-lite をインポート


export const sqliteTestGetPrinterRoute = createRoute({
    method: "get",
    path: "/getPrinter",
    responses: {
        200: {
            description: "Printer information retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        printers: z.array(z.string()).describe("List of available printers"),
                    }).openapi({
                        title: "PrinterResponse",
                        type: "object",
                        description: "Response containing a list of available printers",
                    }),
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

export const sqliteTestGetPrinterHandler: RouteHandler<typeof sqliteTestGetPrinterRoute, ENV> = async (c) => {
    try {
        // ファイルが存在するか確認
        if (!fs.existsSync(filepath)) {
            // ErrorResponseSchema expects { error: string }
            return c.json({ error: "File not found" }, 404);
        }
        // ファイルの内容を読み込む
        // const fileBuffer = fs.readFileSync(filepath);

        // ここでプリンターにファイルを送信する処理を追加
        // 例えば、printDocument関数を呼び出すなど
        os.platform() === 'win32' ? console.log('Windows環境です') : console.log('Windows以外の環境です');
        let printers: string[] = [];
        if (os.platform() === 'win32') {
            //printer一覧をutf-8にて取得
            const execSync = require('child_process').execSync;
            const command = 'wmic printer get name';
            const outputBuffer = execSync(command, { encoding: 'buffer' })
                ;
            const outputUtf8 = iconv.decode(outputBuffer, 'cp932');

            printers = outputUtf8
                .split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0 && line.toLowerCase() !== 'name');

            //shiftJISからUTF-8に変換

            // console.log('Available Printers:', printers);
            // const currentPath = process.cwd();
            // console.log('Current Directory:', currentPath);
            // const adobePath = "C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe";
            // const commandPrint = `"${adobePath}" /t "${currentPath}\\${filepath}" "LBP221(旅費)"`;
            // console.log('Print Command:', commandPrint);
            // try {
            //     execSync(commandPrint);
            //     console.log('File sent to printer successfully.');
            // } catch (printError: any) {
            //     console.error('Error sending file to printer:', printError.message);
            //     return c.json({ error: `Failed to print: ${printError.message}` }, 500);
            // }
            // console.log('Available Printers:', output);
        }

        // NullResponseSchema expects { message?: string }
        return c.json({ printers: printers }, 200);
        // return c.json({ message: "Printer information retrieved successfully", data: fileBuffer }, 200);
    } catch (error) {
        console.error("Error retrieving printer information:", error);
        // Always return 500 for unexpected errors, as defined in your route
        return c.json({ error: "Internal Server Error" }, 500);
    }
}