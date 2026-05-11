module.exports = {
  apps: [
    {
      name: 'lvtransport-api',
      cwd: '/home/ubuntu/lvtransport-platform',
      script: 'pnpm',
      args: '--filter @lvtransport/api start',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '15s',
      exp_backoff_restart_delay: 200,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
