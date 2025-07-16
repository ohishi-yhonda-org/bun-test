// ecosystem.config.js (または類似のファイル)
module.exports = {
    apps: [{
        name: 'bun-test-app',
        script: 'dist/index.js',
        interpreter: 'bun', // <-- PM2にBunを使用するように指示するためにこの行を追加
        env: {
            PORT: 3000, // アプリケーションがこのポートを使用する場合
        },
        // このパスが正しく、絶対パスであることを確認してください
        cwd: 'C:/actions-runner/_work/bun-test/bun-test/', // <-- これは重要です
        // ... その他のPM2設定
    }]
};