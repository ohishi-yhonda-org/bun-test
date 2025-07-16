// ecosystem.config.js (または類似のファイル)
module.exports = {
    apps: [{
        name: 'bun-test-app',
        script: 'dist/index.js',
        // このパスが正しく、絶対パスであることを確認してください
        cwd: 'C:/actions-runner/_work/bun-***/bun-***/', // <-- これは重要です
        // ... その他のPM2設定
    }]
};