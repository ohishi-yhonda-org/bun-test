import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { NullResponseSchema, ErrorResponseSchema } from "../openApi/schema";
import { ENV } from "..";
import { handleSqliteError } from "../utils/sqliteErrorHandler";
import { exec } from 'child_process'; // exec をインポート
import { Context } from "hono";
import { spawn } from "child_process"; // spawn をインポート

import { promisify } from 'util';

const execPromise = promisify(exec);

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
// const ADOBE_ACROBAT_PATH = process.env.ADOBE_ACROBAT_PATH;



// Adobe Acrobat のパスとPDFファイルパス、プリンター名は実際の値に置き換えてください
const ADOBE_ACROBAT_PATH = "C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe";
const PDF_FILE_PATH = "C:\\actions-runner\\_work\\bun-test\\bun-test\\ryohi.pdf";
const PRINTER_NAME = "LBP221-ryohi";

// コマンドと引数を分割
const command = ADOBE_ACROBAT_PATH;
const args = ["/t", PDF_FILE_PATH, PRINTER_NAME];

async function executePrintCommandWithSpawn(c: Context) {
    console.log(`[${new Date().toISOString()}] Attempting to execute command with spawn: ${command} ${args.join(' ')}`);

    return new Promise<void>((resolve, reject) => {
        // オプションとして、Windows上でのみ隠しウィンドウで実行するためのオプション
        // detached: true と stdio: 'ignore' を組み合わせると、親プロセスから独立し、標準入出力を無視
        // これにより、サービスのデッドロックを防ぐ可能性も
        const child = spawn(command, args, {
            // detached: true, // プロセスを独立させる（親プロセスが終了しても子プロセスは生き残る）
            // stdio: 'ignore', // 標準入出力ストリームを無視
            timeout: 120000 // タイムアウトを設定 (ミリ秒)
        });

        let stdoutBuffer = '';
        let stderrBuffer = '';

        child.stdout.on('data', (data) => {
            stdoutBuffer += data.toString();
            console.log(`[${new Date().toISOString()}] STDOUT from Acrobat: ${data.toString()}`);
        });

        child.stderr.on('data', (data) => {
            stderrBuffer += data.toString();
            console.error(`[${new Date().toISOString()}] STDERR from Acrobat: ${data.toString()}`);
        });

        child.on('error', (err) => {
            // プロセス自体が起動できなかった場合のエラー
            console.error(`[${new Date().toISOString()}] SPAWN ERROR: Failed to start child process - ${err.message}`);
            reject(new Error(`Failed to start print process: ${err.message}`));
        });

        child.on('close', (code) => {
            // プロセスが終了した
            console.log(`[${new Date().toISOString()}] Child process closed with code: ${code}`);
            if (stdoutBuffer) {
                console.log(`[${new Date().toISOString()}] Full STDOUT buffer:\n${stdoutBuffer}`);
            }
            if (stderrBuffer) {
                console.error(`[${new Date().toISOString()}] Full STDERR buffer:\n${stderrBuffer}`);
            }

            if (code === 0) {
                console.log(`[${new Date().toISOString()}] Print command executed successfully.`);
                resolve();
            } else {
                // エラーコードで終了した場合
                console.error(`[${new Date().toISOString()}] Print command failed with exit code ${code}.`);
                reject(new Error(`Print command failed with exit code ${code}. STDERR: ${stderrBuffer || 'No stderr output.'}`));
            }
        });

        child.on('timeout', () => {
            // タイムアウトした
            console.error(`[${new Date().toISOString()}] Child process timed out after 120000ms.`);
            child.kill(); // 強制終了
            reject(new Error(`Print process timed out.`));
        });
    });
}


export const sqliteTestPrintHandler: RouteHandler<typeof sqliteTestPrintRoute, ENV> = async (c) => {
    try {
        // Print job submission logic goes here
        // file 作成
        const filepath = `ryohi.pdf`;
        const fs = require('fs');

        console.log('Submitting print job');
        const fileContent = await c.req.parseBody();

        // PDFファイルの存在と読み取り権限
        try {
            await fs.promises.access(filepath, fs.constants.R_OK);
            console.log(`[${new Date().toISOString()}] PDF file exists and is readable: ${filepath}`);
        } catch (err: any) {
            console.error(`[${new Date().toISOString()}] Error accessing PDF file: ${filepath}`, err.message);
        }
        const adobePath = ADOBE_ACROBAT_PATH?.toString() || "C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe";

        // Acrobat.exeの存在と実行（読み取り）権限
        // WindowsではR_OKで実行可能とみなされることが多い
        try {
            await fs.promises.access(adobePath, fs.constants.R_OK);
            console.log(`[${new Date().toISOString()}] Acrobat.exe exists and is accessible: ${adobePath}`);
        } catch (err: any) {
            console.error(`[${new Date().toISOString()}] Error accessing Acrobat.exe: ${adobePath}`, err.message);
        }


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
        // exec(commandPrint, (error, stdout, stderr) => {


        //     if (error) {
        //         console.error('Error sending file to printer:', error.message);
        //         // エラー応答は Hono の Context を使って返す
        //         // 非同期なので、ここで直接return c.json()とはできないため、
        //         // 適切なエラーハンドリングまたは通知メカニズムを考慮する必要がある
        //         // 例: ログに記録し、クライアントにはすぐにOKを返しておくか、
        //         // 後でWebsocket等で結果を通知する
        //         return; // ここで早期リターン
        //     }
        //     if (stderr) {
        //         console.warn('Printer command stderr:', stderr);
        //     }
        //     console.log('File sent to printer successfully.');
        //     console.log('Printer command stdout:', stdout);
        //     // 成功時の処理（クライアントへの通知など）
        // });
        await executePrintCommandWithSpawn(c)
        // try {
        //     const { stdout, stderr } = await execPromise(commandPrint, { timeout: 120000 });

        //     if (stdout) {
        //         console.log('--- STDOUT ---');
        //         console.log(stdout);
        //         console.log('--------------');
        //     }

        //     if (stderr) {
        //         console.error('--- STDERR ---');
        //         console.error(stderr);
        //         console.error('--------------');
        //     }
        //     console.log('Print command finished. Check printer queue and event logs for status.');

        // } catch (error: any) {

        //     console.error('--- PRINT COMMAND FAILED (CATCH BLOCK) ---');
        //     console.error(`Error message: ${error.message}`);
        //     console.error(`Error code: ${error.code}`); // コマンドの終了コード
        //     if (error.stdout) {
        //         console.error('STDOUT (from error object):', error.stdout);
        //     }
        //     if (error.stderr) {
        //         console.error('STDERR (from error object):', error.stderr); // エラーオブジェクト内のstderr
        //     }
        //     console.error('------------------------------------------');
        // }
        // console.log

        console.log(`Print job submitted for file: ${filepath}`);
        return c.json({}, 200);
    } catch (error) {
        console.error("Error submitting print job:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
};
