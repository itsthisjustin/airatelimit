import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ProjectsModule } from '../projects/projects.module';
import { UsageModule } from '../usage/usage.module';
import { ProvidersModule } from '../providers/providers.module';
import { SecurityModule } from '../security/security.module';
import { SecurityEvent } from '../security/security-event.entity';

@Module({
  imports: [
    ProjectsModule,
    UsageModule,
    ProvidersModule,
    SecurityModule,
    TypeOrmModule.forFeature([SecurityEvent]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}

