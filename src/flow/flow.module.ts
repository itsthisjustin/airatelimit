import { Module } from '@nestjs/common';
import { FlowExecutorService } from './flow-executor.service';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [UsageModule],
  providers: [FlowExecutorService],
  exports: [FlowExecutorService],
})
export class FlowModule {}

