module.exports = {
  apps: [
    {
      name: 'APP',
      script: './src/app.js',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
