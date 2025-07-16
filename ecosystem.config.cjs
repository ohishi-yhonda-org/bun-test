// ecosystem.config.js (または類似のファイル)
module.exports = {
    apps: [{
        name: 'bun-test-app',
        script: 'dist/index.js',
        interpreter: 'node', // NodeJSを使用（BunバイナリがPM2で安定しない場合）
        env: {
            PORT: 3000,
            NODE_ENV: 'production'
        },
        // 作業ディレクトリを相対パスで指定（CI/CD環境で動的に決定）
        cwd: process.cwd(),
        // PM2設定の改善
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        max_memory_restart: '1G',
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};