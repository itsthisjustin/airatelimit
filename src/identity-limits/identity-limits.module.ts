import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityLimit } from './identity-limit.entity';
import { IdentityLimitsService } from './identity-limits.service';
import { IdentityLimitsController } from './identity-limits.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdentityLimit]),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [IdentityLimitsController],
  providers: [IdentityLimitsService],
  exports: [IdentityLimitsService],
})
export class IdentityLimitsModule {}

