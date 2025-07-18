// ecosystem.config.js (または類似のファイル)
module.exports = {
    apps: [{
        name: 'bun-test-app',
        script: 'dist/index.js',
        interpreter: 'node', // Node.jsを使用してSQLiteライブラリとの互換性を確保
        interpreter_args: [], // Node.jsの実行引数
        env: {
            PORT: 3000,
            NODE_ENV: 'production',
            // Node.jsでの実行のための設定
            // 環境変数を明示的に設定
            DB_USERNAME: process.env.DB_USERNAME || '',
            DB_PASSWORD: process.env.DB_PASSWORD || '',
            DB_HOST: process.env.DB_HOST || '',
            DB_PORT: process.env.DB_PORT || '1433',
            DATABASE: process.env.DATABASE || '',
            DATABASE_URL: process.env.DATABASE_URL || ''
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
        time: true,
        // Node.jsでの起動に必要な設定
        node_args: [],
        args: [],
        // PM2でのNode.js実行時の設定
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        // 標準出力をキャプチャするための設定
        combine_logs: true
    }]
};