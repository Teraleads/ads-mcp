module.exports = {
  apps: [
    {
      name: "unified-ads-mcp",
      script: "dist/index.js",
      cwd: "/root/unified-ads-mcp",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        TRANSPORT: "http",
        PORT: "3003",
      },
      env_file: "/root/unified-ads-mcp/.env",
      error_file: "/root/logs/ads-mcp-error.log",
      out_file: "/root/logs/ads-mcp-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
