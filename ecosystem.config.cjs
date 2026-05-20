const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'lvtransport-api',
      cwd: process.env.LVTP_ROOT || path.resolve(__dirname),
      script: 'pnpm',
      args: '--filter @lvtransport/api start',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '15s',
      exp_backoff_restart_delay: 200,
      max_memory_restart: '500M',
      kill_timeout: 5000,
      out_file: '/var/log/lvtp/api-out.log',
      error_file: '/var/log/lvtp/api-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
