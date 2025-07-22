import ipp from 'ipp';



// プリンター情報
const PRINTER_HOST: string = '172.18.21.60'; // LBP221のIPアドレス
const PRINTER_PORT: number = 631;           // IPPの標準ポート
const PRINTER_PATH: string = '/ipp/print';  // 一般的なIPPパス (プリンターによって異なる場合あり)


import { createRoute, RouteHandler, z } from '@hono/zod-openapi';
import { NullResponseSchema, ErrorResponseSchema } from '../openApi/schema';
import { ENV } from '..';
import { handleSqliteError } from '../utils/sqliteErrorHandler';



async function getPrinterAttributes() {
    const uri: string = `ipp://${PRINTER_HOST}:${PRINTER_PORT}${PRINTER_PATH}`;

    const message = {
        "operation-attributes-tag": {
            "attributes-charset": "utf-8",
            "attributes-natural-language": "en",
            "printer-uri": uri,
            "requested-attributes": [
                "media-supported", // サポートされているメディア（用紙）のリスト
                "media-ready",     // 現在セットされているメディアのリスト
                "media-type-supported", // サポートされているメディアタイプ（例: "plain", "glossy"）
                "media-source-supported" // サポートされている給紙トレイ
            ]
        } as ipp.OperationAttributes
    };

    console.log(`プリンター (${uri}) から属性情報を取得中...`);

    try {
        const buffer = ipp.serialize(message);
        ipp.request(uri, buffer, (err: any, response: any) => {
            if (err) {
                console.error('属性取得中にエラーが発生しました:', err.message || err);
                return;
            }

            if (response['operation-attributes-tag'] && response['operation-attributes-tag']['status-code'] === 'successful-ok') {
                const printerAttributes = response['printer-attributes-tag'];
                console.log('--- プリンター属性 ---');
                if (printerAttributes) {
                    for (const key in printerAttributes) {
                        if (printerAttributes.hasOwnProperty(key)) {
                            console.log(`${key}:`, printerAttributes[key]);
                        }
                    }
                } else {
                    console.log('プリンター属性タグが見つかりませんでした。');
                }
            } else {
                console.error('プリンター属性の取得に失敗しました:', response);
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('属性取得中にエラーが発生しました:', error.message);
        } else {
            console.error('属性取得中に不明なエラーが発生しました:', error);
        }
    }
}


export const sqliteTestGetPrinterAttributesRoute = createRoute({
    method: "get",
    path: "/getPrinterAttributes",
    responses: {
        200: {
            description: "プリンター属性の取得に成功しました。",
            content: {
                "application/json": {

                    schema: NullResponseSchema
                }
            }
        },
        500: {
            description: "プリンター属性の取得に失敗しました。",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema
                }
            }
        }
    }
});

export const sqliteTestGetPrinterAttributesHandler: RouteHandler<typeof sqliteTestGetPrinterAttributesRoute, ENV> = async (c) => {
    try {
        await getPrinterAttributes();
        return c.json({}, 200);
    } catch (error) {
        console.error('プリンター属性の取得中にエラーが発生しました:', error);
        // Always return 500 for errors, as defined in your OpenAPI schema
        return c.json({ error: (error instanceof Error ? error.message : 'Unknown error') }, 500);
    }
}