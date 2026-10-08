// PM2 process for the Zigex student app on the VPS.
// The deploy script copies this file to $APP_DIR/shared/ and starts it from there.
// `current` is a symlink to the active release, so a restart picks up the new code.
// One file serves both sites: production (zigex, port 3000, /var/www/zigex) and
// development (zigex-dev, port 3100, /var/www/zigex-dev), chosen by these variables.
const APP_DIR = process.env.APP_DIR || "/var/www/zigex";
const APP_NAME = process.env.APP_NAME || "zigex";
const APP_PORT = process.env.APP_PORT || "3000";

module.exports = {
  apps: [
    {
      name: APP_NAME,
      cwd: `${APP_DIR}/current`,
      script: "server.js",
      // Secrets come from one file outside the releases (Node 20.6+ --env-file).
      // Large header limit: session cookies plus Google sign-in can exceed Node's 16 KB default.
      node_args: `--env-file=${APP_DIR}/shared/.env --max-http-header-size=128000`,
      env: {
        NODE_ENV: "production",
        PORT: APP_PORT,
        // Only Nginx on the same machine should reach the app.
        HOSTNAME: "127.0.0.1",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "700M",
      // Restart if it crashes, but not in a tight loop.
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 3000,
      time: true,
      out_file: `${APP_DIR}/shared/logs/out.log`,
      error_file: `${APP_DIR}/shared/logs/error.log`,
      merge_logs: true,
    },
  ],
};
