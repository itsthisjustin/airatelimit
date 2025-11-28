import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('database.url');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined');
        }

        const url = new URL(databaseUrl);
        const nodeEnv = configService.get<string>('nodeEnv');
        const isProduction = nodeEnv === 'production';

        return {
          type: 'postgres',
          host: url.hostname,
          port: parseInt(url.port, 10) || 5432,
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          
          // Auto-create tables on startup (safe for new deployments)
          synchronize: true,
          
          // ====================================
          // CONNECTION POOL SETTINGS
          // ====================================
          // Pool size based on environment
          // Production: larger pool for concurrent requests
          // Development: smaller pool to save resources
          poolSize: isProduction ? 20 : 5,
          
          // Connection timeout (ms) - how long to wait for a connection from pool
          connectionTimeoutMillis: 10000,
          
          // Idle timeout (ms) - how long a connection can be idle before being closed
          idleTimeoutMillis: 30000,
          
          // ====================================
          // QUERY SETTINGS
          // ====================================
          // Statement timeout (ms) - max time for a single query
          // Prevents runaway queries from blocking the pool
          extra: {
            statement_timeout: 30000, // 30 seconds max query time
            idle_in_transaction_session_timeout: 60000, // 60 seconds max idle in transaction
            // Enable prepared statements for better performance
            max: isProduction ? 20 : 5,
          },
          
          // ====================================
          // LOGGING
          // ====================================
          // Only log errors and schema changes, not every query
          logging: isProduction 
            ? ['error'] 
            : ['error', 'warn', 'schema'],
          
          // Log slow queries in production (> 1 second)
          maxQueryExecutionTime: isProduction ? 1000 : undefined,
          
          // ====================================
          // SSL (for production)
          // ====================================
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
