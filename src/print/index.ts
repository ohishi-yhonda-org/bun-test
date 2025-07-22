import * as ipp from 'ipp';
import * as fs from 'fs';
import * as path from 'path';

// プリンター情報
const PRINTER_HOST: string = '172.18.21.60'; // LBP221のIPアドレス
const PRINTER_PORT: number = 631;           // IPPの標準ポート
const PRINTER_PATH: string = '/ipp/print';  // 一般的なIPPパス (プリンターによって異なる場合あり)

/**
 * IPPプリンターにドキュメントを印刷する非同期関数
 * @param fileBuffer 印刷するファイルのBufferデータ
 * @param originalname ファイルの元の名前 (ジョブ名として使用)
 * @param mimetype ファイルのMIMEタイプ (document-formatとして使用)
 * @returns 成功した場合はジョブID、失敗した場合はエラー
 */
export async function printDocument(fileBuffer: Buffer, originalname: string, mimetype: string): Promise<string | Error> {
    try {
        const uri: string = `ipp://${PRINTER_HOST}:${PRINTER_PORT}${PRINTER_PATH}`;

        const message = {
            "operation-attributes-tag": {
                "attributes-charset": "utf-8",
                "attributes-natural-language": "en",
                "printer-uri": uri,
                "requesting-user-name": "web-print-user",
                "job-name": `Web Print: ${originalname}`,
                "document-format": mimetype, // アップロードされたファイルのMIMEタイプを使用
            } as ipp.OperationAttributes,
            "data": fileBuffer
        };

        console.log(`プリンター (${uri}) へ印刷ジョブを送信中... ファイル: ${originalname}`);

        const printer = new ipp.Printer(uri);
        const response: any = await new Promise((resolve, reject) => {
            printer.execute("Print-Job", message, (error: Error | null, response: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        const statusCode = response['statusCode'];
        if (statusCode === 'successful-ok') {
            const jobAttributes = response['job-attributes-tag'];
            const jobId = jobAttributes?.['job-id'];
            console.log(`印刷ジョブが正常に送信されました。ジョブID: ${jobId}`);
            return `印刷ジョブが正常に送信されました。ジョブID: ${jobId}`;
        } else {
            console.error('印刷ジョブの送信に失敗しました:', response);
            return new Error(`印刷ジョブの送信に失敗しました: ${JSON.stringify(response)}`);
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error('印刷中にエラーが発生しました:', error.message);
            return new Error(`印刷中にエラーが発生しました: ${error.message}`);
        } else {
            console.error('印刷中に不明なエラーが発生しました:', error);
            return new Error(`印刷中に不明なエラーが発生しました: ${JSON.stringify(error)}`);
        }
    }
}