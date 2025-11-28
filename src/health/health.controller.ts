import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Health check endpoint for container orchestration
 * Not behind auth - needs to be accessible for probes
 */
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'unknown',
    };

    try {
      // Quick database connectivity check
      await this.dataSource.query('SELECT 1');
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      checks.status = 'degraded';
    }

    return checks;
  }

  @Get('live')
  liveness() {
    // Simple liveness probe - just confirms the process is running
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async readiness() {
    // Readiness probe - confirms the app can handle traffic
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'not_ready', timestamp: new Date().toISOString() };
    }
  }
}

