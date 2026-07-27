import { app } from './app';
import { env } from './config/env';
import { testConnection, pool } from './config/database';

async function bootstrap() {
  try {
    // 1. Verify Database Connection
    await testConnection();

    // 2. Start Server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 SGIA Backend running in ${env.NODE_ENV} mode`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
    });

    // 3. Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 ${signal} received. Closing resources...`);
      server.close(async () => {
        console.log('🚪 Web server closed.');
        await pool.end();
        console.log('🗄️ Database pool closed.');
        process.exit(0);
      });

      // Force exit if shutdown takes too long
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('FATAL ERROR during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
